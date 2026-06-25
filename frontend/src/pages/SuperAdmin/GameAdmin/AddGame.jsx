import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateGameMutation } from '../../../features/games/gameApiSlice';
import ImageUpload from '../../../components/ImageUpload';

const AddGame = () => {
  const navigate = useNavigate();
  const [createGame, { isLoading }] = useCreateGameMutation();

  const [formData, setFormData] = useState({
    title: '',
    logo: '',
    banner: '',
    version: '1.0.0',
    rating: 0,
    review: '',
    description: '',
    githubLink: '',
    videoUrl: '',
    isPaid: false,
    price: 0,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.githubLink) {
      return toast.error('Title and GitHub Link are required');
    }

    try {
      await createGame(formData).unwrap();
      toast.success('Game added successfully');
      navigate('/superadmin/games');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add game');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/superadmin/games" className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Add New Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1f] rounded-2xl border border-white/5 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Game Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Action RPG"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">GitHub Link *</label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <ImageUpload 
              type="image"
              label="Logo Image"
              value={formData.logo}
              onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
            />
          </div>

          <div className="space-y-2">
            <ImageUpload 
              type="image"
              label="Banner Image"
              value={formData.banner}
              onChange={(url) => setFormData(prev => ({ ...prev, banner: url }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Video Trailer Link</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="e.g. YouTube Video Link"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2 p-4 bg-black/20 border border-white/10 rounded-xl md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                className="w-5 h-5 rounded border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 bg-black/50"
              />
              <span className="text-sm font-bold text-white">This is a Paid Game</span>
            </label>
            
            {formData.isPaid && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-slate-300 block mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price in INR"
                  className="w-full max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required={formData.isPaid}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Version</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="e.g. 1.0.0"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Rating (0-5)</label>
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Short Review</label>
          <input
            type="text"
            name="review"
            value={formData.review}
            onChange={handleChange}
            placeholder="e.g. Amazing graphics and gameplay!"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Detailed description of the game..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Save className="w-5 h-5" /> {isLoading ? 'Saving...' : 'Save Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGame;
