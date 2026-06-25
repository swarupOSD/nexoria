import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateMovieMutation } from '../../../features/movie/movieApiSlice';
import { useGetAdminMovieCategoriesQuery } from '../../../features/movieCategory/movieCategoryApiSlice';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Save, Plus, Trash2, 
  Image as ImageIcon, Film, LayoutList, Link as LinkIcon
} from 'lucide-react';

const AddMovie = ({ type = 'Movie' }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createMovie, { isLoading }] = useCreateMovieMutation();
  const { data: categoriesRes } = useGetAdminMovieCategoriesQuery();
  const categories = categoriesRes?.data || [];

  const [formData, setFormData] = useState({
    title: '', originalTitle: '', slug: '', category: '', 
    status: 'Draft', visibilityStatus: 'Public', appType: 'Free',
    price: 0, isFeatured: false, isTrending: false,
    shortDescription: '', description: '',
    
    // Media Info
    posterImage: '', bannerImage: '', mobileBanner: '', desktopBanner: '',
    backdropImages: [], galleryImages: [], trailerUrl: '', videoUrl: '',
    
    // Details
    releaseDate: '', releaseYear: '', runtime: '', language: '', country: '',
    director: '', writers: [], producers: [], cast: [], genre: [],
    tags: [], ageRating: '', quality: [], audio: [], subtitles: [],
    movieType: type === 'Web Series' ? 'Web Series' : type === 'Animation' ? 'Animation' : 'Movie', version: '',
    imdbRating: 0, tmdbRating: 0, seoTitle: '', seoDescription: '',
    
    // Download Links
    downloadLinks: [],
    
    // Web Series Specific
    seasons: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value) => {
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const addDownloadLink = () => {
    setFormData(prev => ({
      ...prev,
      downloadLinks: [...prev.downloadLinks, { label: '', url: '', quality: '', isActive: true }]
    }));
  };

  const updateDownloadLink = (index, field, value) => {
    const newLinks = [...formData.downloadLinks];
    newLinks[index][field] = value;
    setFormData({ ...formData, downloadLinks: newLinks });
  };

  const removeDownloadLink = (index) => {
    const newLinks = formData.downloadLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, downloadLinks: newLinks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.category || !formData.posterImage || !formData.description) {
      toast.error('Please fill required fields (Title, Slug, Category, Poster, Description)');
      return;
    }

    try {
      await createMovie(formData).unwrap();
        toast.success(`${type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'} published successfully`);
        let redirectPath = '/superadmin/movies';
        if (type === 'Web Series') redirectPath = '/superadmin/tv-shows';
        if (type === 'Animation') redirectPath = '/superadmin/animation';
        navigate(redirectPath);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create movie');
    }
  };

  // --- Step Components --- //

  const Step1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Original Title</label>
          <input type="text" name="originalTitle" value={formData.originalTitle} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">URL Slug *</label>
          <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white">
            <option value="Draft">Draft</option>
            <option value="Active">Published</option>
            <option value="Hidden">Hidden</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
          <select name="visibilityStatus" value={formData.visibilityStatus} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white">
            <option value="Public">Public</option>
            <option value="Premium Only">Private (Premium)</option>
            <option value="Admin Only">Admin Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
          <select name="appType" value={formData.appType} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white">
            <option value="Free">Free</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>

      {formData.appType === 'Premium' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Price ($)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      )}

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded border-white/10 bg-[#111] text-purple-600 focus:ring-purple-600 focus:ring-offset-[#111]" />
          Featured Movie
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4 rounded border-white/10 bg-[#111] text-purple-600 focus:ring-purple-600 focus:ring-offset-[#111]" />
          Trending Movie
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Short Description</label>
        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Full Description *</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white"></textarea>
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Poster Image URL (2:3) *</label>
          <input type="text" name="posterImage" value={formData.posterImage} onChange={handleChange} required className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cover Banner URL (16:9)</label>
          <input type="text" name="bannerImage" value={formData.bannerImage} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Banner URL</label>
          <input type="text" name="mobileBanner" value={formData.mobileBanner} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Desktop Banner URL</label>
          <input type="text" name="desktopBanner" value={formData.desktopBanner} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Trailer URL (YouTube)</label>
          <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Direct Video URL</label>
          <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Gallery Images (Comma separated URLs)</label>
        <textarea name="galleryImages" value={formData.galleryImages.join(', ')} onChange={(e) => handleArrayChange('galleryImages', e.target.value)} rows="3" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" placeholder="url1, url2, url3"></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Backdrop Images (Comma separated URLs)</label>
        <textarea name="backdropImages" value={formData.backdropImages.join(', ')} onChange={(e) => handleArrayChange('backdropImages', e.target.value)} rows="3" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" placeholder="url1, url2"></textarea>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Movie Type</label>
          <select name="movieType" value={formData.movieType} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white">
            <option value="Movie">Movie</option>
            <option value="Web Series">Web Series</option>
            <option value="Animation">Animation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Release Date</label>
          <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Release Year</label>
          <input type="number" name="releaseYear" value={formData.releaseYear} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Runtime</label>
          <input type="text" name="runtime" value={formData.runtime} onChange={handleChange} placeholder="e.g. 120 min" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
          <input type="text" name="language" value={formData.language} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
          <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Version</label>
          <input type="text" name="version" value={formData.version} onChange={handleChange} placeholder="Hindi Dubbed, Director Cut" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Age Rating</label>
          <input type="text" name="ageRating" value={formData.ageRating} onChange={handleChange} placeholder="PG-13, R, 18+" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Director</label>
          <input type="text" name="director" value={formData.director} onChange={handleChange} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cast (Comma separated)</label>
          <input type="text" name="cast" value={formData.cast.join(', ')} onChange={(e) => handleArrayChange('cast', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Writers (Comma separated)</label>
          <input type="text" name="writers" value={formData.writers.join(', ')} onChange={(e) => handleArrayChange('writers', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Producers (Comma separated)</label>
          <input type="text" name="producers" value={formData.producers.join(', ')} onChange={(e) => handleArrayChange('producers', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Genres (Comma separated)</label>
          <input type="text" name="genre" value={formData.genre.join(', ')} onChange={(e) => handleArrayChange('genre', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Quality (Comma separated)</label>
          <input type="text" name="quality" value={formData.quality.join(', ')} onChange={(e) => handleArrayChange('quality', e.target.value)} placeholder="480p, 720p, 1080p, 4K" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Audio (Comma separated)</label>
          <input type="text" name="audio" value={formData.audio.join(', ')} onChange={(e) => handleArrayChange('audio', e.target.value)} placeholder="English, Hindi, Bengali" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white" />
        </div>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6">
      {formData.movieType === 'Web Series' && (
        <div className="p-6 bg-[#111] border border-amber-500/30 rounded-xl mb-6 text-center">
          <p className="text-amber-500 font-medium">To manage Web Series Seasons and Episodes, please save this movie first, then use the "Series Manager" section.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Download Links</h3>
        <button type="button" onClick={addDownloadLink} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <div className="space-y-4">
        {formData.downloadLinks.map((link, idx) => (
          <div key={idx} className="p-4 bg-[#111] border border-white/10 rounded-xl flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Server Name / Label</label>
                <input type="text" value={link.label} onChange={(e) => updateDownloadLink(idx, 'label', e.target.value)} placeholder="e.g. Google Drive, Mega" className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
                <input type="text" value={link.url} onChange={(e) => updateDownloadLink(idx, 'url', e.target.value)} placeholder="https://..." className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quality</label>
                <input type="text" value={link.quality} onChange={(e) => updateDownloadLink(idx, 'quality', e.target.value)} placeholder="1080p" className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm" />
              </div>
            </div>
            <button type="button" onClick={() => removeDownloadLink(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg mt-5">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {formData.downloadLinks.length === 0 && (
          <p className="text-slate-500 text-center py-8 border border-dashed border-white/10 rounded-xl">No download links added.</p>
        )}
      </div>
    </div>
  );

  const steps = [
    { title: 'Basic Info', icon: <Film className="w-5 h-5" />, component: Step1 },
    { title: 'Media Info', icon: <ImageIcon className="w-5 h-5" />, component: Step2 },
    { title: 'Details Info', icon: <LayoutList className="w-5 h-5" />, component: Step3 },
    { title: 'Download Links', icon: <LinkIcon className="w-5 h-5" />, component: Step4 }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Plus className="w-8 h-8 text-purple-600" />
          Add New {type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'}
        </h1>
        <p className="text-slate-500 mt-2">Fill in the details below to publish a new {type === 'Web Series' ? 'tv show' : type === 'Animation' ? 'animation' : 'movie'} to the platform.</p>
      </div>

      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto custom-scrollbar pb-2">
        {steps.map((s, idx) => (
          <div key={idx} className={`flex items-center gap-3 min-w-max px-4 py-2 rounded-xl transition-all ${
            step === idx + 1 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
              : step > idx + 1
                ? 'bg-purple-600/20 text-purple-400'
                : 'bg-slate-100 dark:bg-[#111] text-slate-400'
          }`}>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/20 text-xs font-bold">{idx + 1}</span>
            <span className="font-medium flex items-center gap-2">{s.icon} {s.title}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[step - 1].component()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                step === 1 
                  ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#111] text-slate-400' 
                  : 'bg-slate-100 dark:bg-[#111] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-600/20 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Movie</>}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMovie;