import CustomSearchBar from '../../../components/CustomSearchBar';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  useGetAdminMoviesQuery, 
  useCreateMovieMutation, 
  useUpdateMovieMutation, 
  useDeleteMovieMutation 
} from '../../../features/movie/movieApiSlice';
import { useGetAdminMovieCategoriesQuery } from '../../../features/movieCategory/movieCategoryApiSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Plus, Edit2, Trash2, Search, Filter, Loader2, X, Eye, EyeOff,
  Image as ImageIcon, CheckCircle, Video, Tag, Clock, Globe, Download
} from 'lucide-react';

const MovieManagement = ({ type = 'Movie' }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic, media, details, links

  // Form State
  const [formData, setFormData] = useState({
    title: '', originalTitle: '', slug: '', category: '', status: 'Draft', visibilityStatus: 'Public',
    appType: 'Free', price: 0, isFeatured: false, isTrending: false,
    description: '', shortDescription: '',
    releaseDate: '', releaseYear: '', country: '', language: '', genre: [], runtime: '',
    director: '', cast: [], imdbRating: 0, tmdbRating: 0,
    trailerUrl: '', videoUrl: '',
    seoTitle: '', seoDescription: '', tags: []
  });

  const [downloadLinks, setDownloadLinks] = useState([]);
  
  // File States
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  // Optional: implement gallery multiple file uploads later if needed
  const [posterPreview, setPosterPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const { data: moviesRes, isLoading, isFetching, refetch } = useGetAdminMoviesQuery({
    page, limit: 10, search, status: statusFilter, movieType: type === 'Web Series' ? 'Web Series' : type === 'Animation' ? 'Animation' : 'Movie'
  });
  
  const { data: categoriesRes } = useGetAdminMovieCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const [createMovie, { isLoading: isCreating }] = useCreateMovieMutation();
  const [updateMovie, { isLoading: isUpdating }] = useUpdateMovieMutation();
  const [deleteMovie] = useDeleteMovieMutation();

  const movies = moviesRes?.data || [];
  const pagination = moviesRes?.pagination || {};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const resetForm = () => {
    setFormData({
      title: '', originalTitle: '', slug: '', category: '', status: 'Draft', visibilityStatus: 'Public',
      appType: 'Free', price: 0, isFeatured: false, isTrending: false,
      description: '', shortDescription: '',
      releaseDate: '', releaseYear: '', country: '', language: '', genre: [], runtime: '',
      director: '', cast: [], imdbRating: 0, tmdbRating: 0,
      trailerUrl: '', videoUrl: '',
      seoTitle: '', seoDescription: '', tags: [],
      movieType: type === 'Web Series' ? 'Web Series' : type === 'Animation' ? 'Animation' : 'Movie'
    });
    setDownloadLinks([]);
    setPosterFile(null);
    setBannerFile(null);
    setVideoFile(null);
    setPosterPreview('');
    setBannerPreview('');
    setActiveTab('basic');
  };

  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setFormData({
      ...movie,
      category: movie.category?._id || '',
      genre: movie.genre || [],
      cast: movie.cast || [],
      tags: movie.tags || [],
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : ''
    });
    setDownloadLinks(movie.downloadLinks || []);
    setPosterPreview(movie.posterImage || '');
    setBannerPreview(movie.bannerImage || '');
    setPosterFile(null);
    setBannerFile(null);
    setVideoFile(null);
    setIsEditMode(true);
    setSelectedMovie(movie);
    setIsModalOpen(true);
    setActiveTab('basic');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie(id).unwrap();
        toast.success('Movie deleted successfully');
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete movie');
      }
    }
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append(type === 'video' ? 'video' : 'image', file);
    const token = localStorage.getItem('token');
    
    const endpoint = type === 'video' ? '/api/upload/video' : '/api/upload/image';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.category || !formData.description) {
      return toast.error('Please fill required basic fields (Title, Slug, Category, Description)');
    }

    try {
      let finalPoster = formData.posterImage;
      let finalBanner = formData.bannerImage;
      let finalVideo = formData.videoFile;

      if (posterFile) {
        toast.loading('Uploading poster...', { id: 'upload' });
        finalPoster = await uploadFile(posterFile, 'image');
      }
      if (bannerFile) {
        toast.loading('Uploading banner...', { id: 'upload' });
        finalBanner = await uploadFile(bannerFile, 'image');
      }
      if (videoFile) {
        toast.loading('Uploading video file (this may take a while)...', { id: 'upload' });
        finalVideo = await uploadFile(videoFile, 'video');
      }
      
      toast.dismiss('upload');

      const submitData = {
        ...formData,
        posterImage: finalPoster,
        bannerImage: finalBanner,
        videoFile: finalVideo,
        downloadLinks
      };

      if (isEditMode) {
        await updateMovie({ id: selectedMovie._id, data: submitData }).unwrap();
        toast.success('Movie updated successfully');
      } else {
        if (!finalPoster) return toast.error('Poster image is required for new movies');
        await createMovie(submitData).unwrap();
        toast.success('Movie created successfully');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.dismiss('upload');
      toast.error(error.data?.message || error.message || 'Operation failed');
    }
  };

  // Quick link manager
  const addLink = () => setDownloadLinks([...downloadLinks, { label: '', url: '', quality: '1080p', isActive: true }]);
  const updateLink = (index, field, value) => {
    const newLinks = [...downloadLinks];
    newLinks[index][field] = value;
    setDownloadLinks(newLinks);
  };
  const removeLink = (index) => setDownloadLinks(downloadLinks.filter((_, i) => i !== index));

  return (
    <div className="p-6">
      <Helmet><title>{type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'} Management | Super Admin</title></Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-500" /> {type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'} Management
          </h1>
          <p className="text-slate-500">Add, edit, and manage your entire {type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'animation' : 'movie'} ecosystem.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" /> Add {type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <CustomSearchBar value={search} placeholder="Search movies..." name="text"  onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pl-4 pr-8 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Hidden">Hidden</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading || isFetching ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/5">
          <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie._id} className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden group flex flex-col">
              <div className="relative aspect-[2/3] bg-slate-100 dark:bg-slate-800">
                <img src={movie.posterImage} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openEditModal(movie)} className="p-2 bg-white/10 hover:bg-purple-500 text-white rounded-lg transition-colors backdrop-blur-sm">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(movie._id)} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-sm">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded shadow-lg ${
                    movie.status === 'Active' ? 'bg-emerald-500 text-white' : 
                    movie.status === 'Draft' ? 'bg-slate-500 text-white' : 'bg-amber-500 text-white'
                  }`}>{movie.status}</span>
                  {movie.appType === 'Premium' && (
                    <span className="px-2 py-1 text-[10px] font-bold rounded shadow-lg bg-amber-500 text-white">PREMIUM</span>
                  )}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{movie.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{movie.category?.name || 'Uncategorized'} • {movie.releaseYear || 'TBA'}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {movie.views}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {movie.downloads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 disabled:opacity-50">Prev</button>
          <span className="px-4 py-2">Page {page} of {pagination.pages}</span>
          <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#1A1A1A] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/5 shrink-0 bg-white dark:bg-[#1A1A1A] z-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isEditMode ? <Edit2 className="w-5 h-5 text-purple-500" /> : <Plus className="w-5 h-5 text-purple-500" />}
                  {isEditMode ? 'Edit Movie' : 'Add New Movie'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-white/5 px-6 shrink-0 overflow-x-auto custom-scrollbar">
                {['basic', 'media', 'details', 'links'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-purple-500 text-purple-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="movieForm" onSubmit={handleSubmit} className="space-y-6">
                  
                  {activeTab === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                          <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Original Title</label>
                          <input type="text" name="originalTitle" value={formData.originalTitle} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL Slug *</label>
                          <input type="text" name="slug" required value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white font-mono text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                          <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white">
                              <option value="Active">Active</option>
                              <option value="Draft">Draft</option>
                              <option value="Hidden">Hidden</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
                            <select name="visibilityStatus" value={formData.visibilityStatus} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white">
                              <option value="Public">Public</option>
                              <option value="Premium Only">Premium Only</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select name="appType" value={formData.appType} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white">
                              <option value="Free">Free</option>
                              <option value="Premium">Premium</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} disabled={formData.appType === 'Free'} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white disabled:opacity-50" />
                          </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trending</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Description *</label>
                        <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={8} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'media' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Poster Upload */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Poster Image (2:3 aspect ratio) *</label>
                          <div className="relative aspect-[2/3] w-48 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => document.getElementById('posterInput').click()}>
                            {posterPreview ? (
                              <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500">Click to upload</span>
                              </>
                            )}
                            <input id="posterInput" type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setPosterFile(file);
                                setPosterPreview(URL.createObjectURL(file));
                              }
                            }} />
                          </div>
                        </div>

                        {/* Banner Upload */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cover Banner (16:9 aspect ratio)</label>
                          <div className="relative aspect-video w-full max-w-sm rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => document.getElementById('bannerInput').click()}>
                            {bannerPreview ? (
                              <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500">Click to upload</span>
                              </>
                            )}
                            <input id="bannerInput" type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setBannerFile(file);
                                setBannerPreview(URL.createObjectURL(file));
                              }
                            }} />
                          </div>
                        </div>
                      </div>

                      <hr className="border-slate-200 dark:border-white/5" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trailer URL (YouTube/Vimeo)</label>
                          <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Direct Video URL (m3u8, mp4)</label>
                          <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://.../video.mp4" className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">OR Local Video Upload (Max 500MB)</label>
                        <div className="flex items-center gap-4">
                           <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-500/10 dark:file:text-purple-400 dark:hover:file:bg-purple-500/20 transition-colors" />
                           {videoFile && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Selected</span>}
                           {formData.videoFile && !videoFile && <span className="text-xs text-blue-500">File already exists on server</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Release Date</label>
                         <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Release Year</label>
                         <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Runtime (e.g. 120 min)</label>
                         <input type="text" name="runtime" value={formData.runtime} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                         <input type="text" name="language" value={formData.language} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                         <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Director</label>
                         <input type="text" name="director" value={formData.director} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cast (Comma separated)</label>
                         <input type="text" value={formData.cast?.join(', ')} onChange={(e) => handleArrayChange(e, 'cast')} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Genres (Comma separated)</label>
                         <input type="text" value={formData.genre?.join(', ')} onChange={(e) => handleArrayChange(e, 'genre')} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (Comma separated)</label>
                         <input type="text" value={formData.tags?.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IMDB Rating</label>
                         <input type="number" step="0.1" max="10" name="imdbRating" value={formData.imdbRating} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TMDB Rating</label>
                         <input type="number" step="0.1" max="10" name="tmdbRating" value={formData.tmdbRating} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SEO Title</label>
                        <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SEO Description</label>
                        <input type="text" name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'links' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Download & Mirror Links</h4>
                        <button type="button" onClick={addLink} className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>

                      {downloadLinks.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                          <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No download links added yet.</p>
                        </div>
                      ) : (
                        downloadLinks.map((link, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className="col-span-3">
                              <input type="text" placeholder="Label (e.g. Server 1)" value={link.label} onChange={(e) => updateLink(index, 'label', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
                            </div>
                            <div className="col-span-5">
                              <input type="url" placeholder="URL (https://...)" value={link.url} onChange={(e) => updateLink(index, 'url', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
                            </div>
                            <div className="col-span-2">
                              <select value={link.quality} onChange={(e) => updateLink(index, 'quality', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500">
                                <option value="4K">4K</option>
                                <option value="1080p">1080p</option>
                                <option value="720p">720p</option>
                                <option value="480p">480p</option>
                                <option value="CAM">CAM</option>
                              </select>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <input type="checkbox" checked={link.isActive} onChange={(e) => updateLink(index, 'isActive', e.target.checked)} className="w-4 h-4 text-purple-600" title="Active" />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button type="button" onClick={() => removeLink(index)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A] shrink-0 flex justify-end gap-3 z-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="movieForm" disabled={isCreating || isUpdating} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                  {(isCreating || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {isEditMode ? 'Update Movie' : 'Save Movie'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieManagement;
