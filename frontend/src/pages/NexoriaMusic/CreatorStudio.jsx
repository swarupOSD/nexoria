import React, { useState, useRef } from 'react';
import { 
  useUploadPodcastAudioMutation, 
  useCreatePodcastMutation, 
  useGetUserPodcastsQuery 
} from '../../features/api/nexoriaMusicApiSlice';
import { Upload, Mic, Image as ImageIcon, Play, Loader2, Plus, Info } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setGlobalTrack, setIsGlobalPlaying } from '../../features/music/musicSlice';
import toast from 'react-hot-toast';

const CreatorStudio = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const [uploadAudio, { isLoading: isUploading }] = useUploadPodcastAudioMutation();
  const [createPodcast, { isLoading: isCreating }] = useCreatePodcastMutation();
  const { data: myPodcastsResponse, isLoading: isLoadingPodcasts } = useGetUserPodcastsQuery();

  const myPodcasts = myPodcastsResponse?.data || [];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit.');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !audioFile) {
      toast.error('Please provide a title and an audio file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('title', title);

      // 1. Upload audio to Telegram
      const uploadRes = await uploadAudio(formData).unwrap();
      
      if (uploadRes.success && uploadRes.fileId) {
        // 2. Create the podcast track
        await createPodcast({
          title,
          genre,
          coverImage,
          telegramFileId: uploadRes.fileId,
          fileSizeBytes: uploadRes.fileSize || audioFile.size
        }).unwrap();

        toast.success('Podcast uploaded successfully!');
        
        // Reset form
        setTitle('');
        setGenre('');
        setCoverImage('');
        setAudioFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.data?.message || 'Failed to upload podcast.');
    }
  };

  const playPodcast = (podcast) => {
    dispatch(setGlobalTrack(podcast));
    dispatch(setIsGlobalPlaying(true));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 pt-24 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-3">
              <Mic className="w-10 h-10 text-purple-400" />
              Creator Studio
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              Share your voice with the world. Upload your podcasts and audio stories for free.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                New Upload
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-5 relative z-10">
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Podcast Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="e.g. Midnight Tech Talks Ep. 1"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Genre (Optional)</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="e.g. Technology, Horror, Comedy"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image URL (Optional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Audio File */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Audio File (Max 50MB) *</label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${audioFile ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="audio/*"
                      className="hidden"
                    />
                    {audioFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Mic className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-purple-300 truncate max-w-full px-2">
                          {audioFile.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          Click to select audio file
                        </span>
                        <span className="text-xs text-gray-500">MP3, M4A, WAV (Max 50MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading || isCreating || !audioFile || !title}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                >
                  {(isUploading || isCreating) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isUploading ? 'Uploading Audio...' : 'Publishing Podcast...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Publish Podcast
                    </>
                  )}
                </button>
                
                <div className="flex items-start gap-2 text-xs text-gray-500 mt-4">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>By uploading, you agree that you own the rights to this audio. Uploads are stored securely and streamed globally.</p>
                </div>
              </form>
            </div>
          </div>

          {/* My Uploads List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              My Published Podcasts
              <span className="bg-white/10 text-gray-300 text-xs py-1 px-3 rounded-full font-medium">
                {myPodcasts.length}
              </span>
            </h2>

            {isLoadingPodcasts ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
            ) : myPodcasts.length === 0 ? (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Podcasts Yet</h3>
                <p className="text-gray-400 max-w-sm">
                  You haven't uploaded any podcasts yet. Use the form to publish your first audio story!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPodcasts.map((podcast) => (
                  <div 
                    key={podcast._id}
                    className="bg-[#111] border border-white/5 hover:border-purple-500/30 rounded-xl p-4 flex gap-4 transition-all group"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#222]">
                      {podcast.coverImage ? (
                        <img src={podcast.coverImage} alt={podcast.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
                          <Mic className="w-8 h-8 text-purple-400 opacity-50" />
                        </div>
                      )}
                      
                      <button 
                        onClick={() => playPodcast(podcast)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-8 h-8 text-white fill-white" />
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-white font-bold text-base line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {podcast.title}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {podcast.artist?.name || 'Unknown Artist'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                        <span className="text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                          {(podcast.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                        </span>
                        <span className="text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                          {new Date(podcast.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatorStudio;
