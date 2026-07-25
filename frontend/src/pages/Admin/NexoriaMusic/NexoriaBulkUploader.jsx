import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Music, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';
import { 
  useCreateNexoriaTrackMutation,
  useGetNexoriaArtistsQuery,
  useCreateNexoriaArtistMutation,
  useGetNexoriaAlbumsQuery,
  useCreateNexoriaAlbumMutation
} from '../../../features/api/nexoriaMusicApiSlice';
import toast from 'react-hot-toast';

const NexoriaBulkUploader = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [filesData, setFilesData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  const { data: artistsData, refetch: refetchArtists } = useGetNexoriaArtistsQuery();
  const { data: albumsData, refetch: refetchAlbums } = useGetNexoriaAlbumsQuery();
  const [createArtist] = useCreateNexoriaArtistMutation();
  const [createAlbum] = useCreateNexoriaAlbumMutation();
  const [createTrack] = useCreateNexoriaTrackMutation();
  
  const artists = artistsData?.data || [];
  const albums = albumsData?.data || [];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        
        jsmediatags.read(file, {
          onSuccess: function(tag) {
            let base64Image = null;
            if (tag.tags.picture) {
              const data = tag.tags.picture.data;
              const format = tag.tags.picture.format;
              let base64String = "";
              for (let i = 0; i < data.length; i++) {
                base64String += String.fromCharCode(data[i]);
              }
              base64Image = `data:${format};base64,${window.btoa(base64String)}`;
            }
            
            resolve({
              id: Math.random().toString(36).substring(7),
              file: file,
              title: tag.tags.title || file.name.replace('.mp3', ''),
              artistName: tag.tags.artist || 'Unknown Artist',
              albumName: tag.tags.album || 'Unknown Album',
              coverImage: base64Image,
              duration: duration || 0,
              status: 'pending', // pending, uploading, success, error
              error: null
            });
          },
          onError: function(error) {
            resolve({
              id: Math.random().toString(36).substring(7),
              file: file,
              title: file.name.replace('.mp3', ''),
              artistName: 'Unknown Artist',
              albumName: 'Unknown Album',
              coverImage: null,
              duration: duration || 0,
              status: 'pending',
              error: null
            });
          }
        });
      });
      audio.addEventListener('error', () => resolve(null));
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.includes('audio') || f.name.endsWith('.mp3'));
      if (droppedFiles.length === 0) return toast.error("Please drop MP3 audio files only.");
      
      const newFiles = [];
      for (const file of droppedFiles) {
        const data = await processFile(file);
        if (data) newFiles.push(data);
      }
      setFilesData(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type.includes('audio') || f.name.endsWith('.mp3'));
      const newFiles = [];
      for (const file of selectedFiles) {
        const data = await processFile(file);
        if (data) newFiles.push(data);
      }
      setFilesData(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id) => {
    setFilesData(prev => prev.filter(f => f.id !== id));
  };

  const updateFileStatus = (id, status, error = null) => {
    setFilesData(prev => prev.map(f => f.id === id ? { ...f, status, error } : f));
  };

  const handleUploadAll = async () => {
    const pendingFiles = filesData.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress({ current: 0, total: pendingFiles.length });

    // Refresh artist/album cache before uploading just in case
    await refetchArtists();
    await refetchAlbums();

    for (let i = 0; i < pendingFiles.length; i++) {
      const item = pendingFiles[i];
      updateFileStatus(item.id, 'uploading');
      
      try {
        // 1. Resolve Artist
        let artistId = null;
        if (item.artistName) {
          const existingArtist = artists.find(a => a.name.toLowerCase() === item.artistName.toLowerCase());
          if (existingArtist) {
            artistId = existingArtist._id;
          } else {
            const newArtist = await createArtist({ name: item.artistName }).unwrap();
            artistId = newArtist.data._id;
            // Optimistic update for next files in loop
            artists.push(newArtist.data);
          }
        }

        // 2. Resolve Album
        let albumId = null;
        if (item.albumName && item.albumName !== 'Unknown Album' && artistId) {
          const existingAlbum = albums.find(a => a.title.toLowerCase() === item.albumName.toLowerCase());
          if (existingAlbum) {
            albumId = existingAlbum._id;
          } else {
            const newAlbum = await createAlbum({ title: item.albumName, artist: artistId }).unwrap();
            albumId = newAlbum.data._id;
            // Optimistic update for next files
            albums.push(newAlbum.data);
          }
        }

        // 3. Create Track
        const formData = new FormData();
        formData.append('title', item.title);
        formData.append('duration', item.duration);
        if (artistId) formData.append('artist', artistId);
        if (albumId) formData.append('album', albumId);
        if (item.coverImage) formData.append('coverImage', item.coverImage);
        formData.append('audio', item.file);

        await createTrack(formData).unwrap();
        updateFileStatus(item.id, 'success');
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

      } catch (error) {
        console.error("Upload failed for", item.title, error);
        updateFileStatus(item.id, 'error', error?.data?.message || 'Upload failed');
      }
    }
    
    setIsUploading(false);
    toast.success("Bulk upload process completed!");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(30,215,96,0.1)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#181818] rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Bulk Audio Uploader <span className="bg-[#1ed760] text-black text-xs px-2 py-0.5 rounded-full uppercase tracking-widest ml-2">Beta</span>
              </h2>
              <p className="text-[#b3b3b3] text-sm mt-1">Drag and drop MP3s. ID3 tags will be auto-extracted.</p>
            </div>
            <button onClick={onClose} disabled={isUploading} className="p-2 text-[#b3b3b3] hover:text-white transition-colors rounded-full hover:bg-white/10 disabled:opacity-50">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {/* Drag Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-[#1ed760] bg-[#1ed760]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input type="file" multiple accept="audio/mpeg, audio/mp3" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Upload className={`w-8 h-8 ${dragActive ? 'text-[#1ed760]' : 'text-[#b3b3b3]'}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Drag & Drop MP3 Files Here</h3>
              <p className="text-[#b3b3b3] text-sm">or click to browse your computer</p>
            </div>

            {/* Queue List */}
            {filesData.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>Upload Queue ({filesData.length})</span>
                  {isUploading && <span className="text-[#1ed760] text-sm">Uploading {uploadProgress.current}/{uploadProgress.total}</span>}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {filesData.map(file => (
                    <div key={file.id} className="flex items-center gap-4 p-3 bg-[#181818] rounded-xl border border-white/5">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0 overflow-hidden shadow-md flex items-center justify-center">
                        {file.coverImage ? (
                          <img src={file.coverImage} className="w-full h-full object-cover" alt="cover" />
                        ) : (
                          <Music className="w-5 h-5 text-[#b3b3b3]" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-white text-sm truncate">{file.title}</span>
                        <span className="text-xs text-[#b3b3b3] truncate">{file.artistName} • {file.albumName}</span>
                      </div>
                      
                      <div className="flex items-center justify-end min-w-[100px]">
                        {file.status === 'pending' && (
                          <button onClick={() => removeFile(file.id)} disabled={isUploading} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {file.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                        {file.status === 'success' && <CheckCircle className="w-5 h-5 text-[#1ed760]" />}
                        {file.status === 'error' && (
                          <div className="flex items-center gap-2 text-red-400 group relative">
                            <AlertCircle className="w-5 h-5" />
                            <div className="absolute right-8 hidden group-hover:block bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20 whitespace-nowrap z-10">
                              {file.error}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-[#181818] rounded-b-2xl flex justify-end gap-3">
            <button 
              onClick={onClose} 
              disabled={isUploading}
              className="px-6 py-2.5 rounded-full font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button 
              onClick={handleUploadAll}
              disabled={isUploading || filesData.filter(f => f.status === 'pending' || f.status === 'error').length === 0}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#1ed760] hover:bg-[#1fdf64] text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(30,215,96,0.3)]"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Start Upload</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NexoriaBulkUploader;
