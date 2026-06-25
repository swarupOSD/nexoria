import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Layers, Loader2, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetAdminHeroDisplaysQuery, 
  useCreateHeroDisplayMutation, 
  useUpdateHeroDisplayMutation, 
  useDeleteHeroDisplayMutation 
} from '../../features/heroDisplay/heroDisplayApiSlice';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
    <div className="p-4 space-y-2">
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

const HeroDisplayManager = () => {
  const { data: resData, isLoading: loading } = useGetAdminHeroDisplaysQuery();
  const items = resData?.data || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [createHeroDisplay, { isLoading: isCreating }] = useCreateHeroDisplayMutation();
  const [updateHeroDisplay, { isLoading: isUpdating }] = useUpdateHeroDisplayMutation();
  const [deleteHeroDisplay] = useDeleteHeroDisplayMutation();

  const saving = isCreating || isUpdating;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [actionLink, setActionLink] = useState('/');
  const [actionText, setActionText] = useState('Learn More');
  const [position, setPosition] = useState('Hero');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);



  const resetForm = () => {
    setTitle(''); setSubtitle(''); setImage('');
    setActionLink('/'); setActionText('Learn More');
    setPosition('Hero'); setIsActive(true); setOrder(0); setEditingId(null);
  };

  const openEdit = (b) => {
    setEditingId(b._id); setTitle(b.title); setSubtitle(b.subtitle || '');
    setImage(b.image); setActionLink(b.actionLink || '/');
    setActionText(b.actionText || 'Learn More'); setPosition(b.position || 'Hero');
    setIsActive(b.isActive); setOrder(b.order || 0); setIsModalOpen(true);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    const t = toast.loading('Uploading...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) { setImage(data.image); toast.success('Uploaded', { id: t }); }
      else toast.error(data.message || 'Upload failed', { id: t });
    } catch { toast.error('Upload error', { id: t }); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, subtitle, image, actionLink, actionText, position, isActive, order };
      
      if (editingId) {
        await updateHeroDisplay({ id: editingId, ...payload }).unwrap();
        toast.success('Display updated');
      } else {
        await createHeroDisplay(payload).unwrap();
        toast.success('Display created');
      }
      
      setIsModalOpen(false); 
      resetForm();
    } catch (err) { 
      toast.error(err?.data?.message || 'Error saving display'); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hero display?')) return;
    try {
      await deleteHeroDisplay(id).unwrap();
      toast.success('Deleted');
    } catch (err) { 
      toast.error(err?.data?.message || 'Delete failed'); 
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hero Display Manager</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage hero sections and featured visual placements.</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-pink-500/25 w-max"
        >
          <Plus className="w-4 h-4" /> Add Display
        </motion.button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-pink-500/60" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No hero displays yet</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first hero display to feature it on the homepage.</p>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 text-pink-500 border border-pink-500/30 hover:bg-pink-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Display
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {items.map((b, i) => (
              <motion.div key={b._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                className={`bg-white dark:bg-white/5 border rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-shadow ${b.isActive ? 'border-slate-200 dark:border-white/10' : 'border-slate-100 dark:border-white/5 opacity-60'}`}>
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {b.image
                    ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    : <ImageIcon className="w-8 h-8 text-slate-300" />
                  }
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="p-1.5 bg-white/90 dark:bg-slate-900/90 text-blue-600 rounded-lg shadow">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-lg shadow">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-[10px] font-bold uppercase">{b.position}</span>
                    <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-[10px]">#{b.order}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{b.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{b.subtitle || 'No subtitle'}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${b.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {b.actionLink && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-[120px]">
                        <LinkIcon className="w-3 h-3 shrink-0" /> {b.actionLink}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Display' : 'Add Display'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Hero display title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Subtitle</label>
                  <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className={inputClass} placeholder="Optional tagline" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Image *</label>
                  <div className="flex gap-2">
                    <input type="text" required value={image} onChange={e => setImage(e.target.value)} placeholder="Image URL or upload below" className={inputClass + ' flex-1'} />
                    <label className="relative overflow-hidden cursor-pointer flex-shrink-0 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> Upload
                      <input type="file" accept="image/*" onChange={uploadImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                  </div>
                  {image && <img src={image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" />}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Action URL</label>
                    <input type="text" value={actionLink} onChange={e => setActionLink(e.target.value)} className={inputClass} placeholder="/premium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Button Text</label>
                    <input type="text" value={actionText} onChange={e => setActionText(e.target.value)} className={inputClass} placeholder="Upgrade Now" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Position</label>
                    <select value={position} onChange={e => setPosition(e.target.value)} className={inputClass}>
                      <option value="Hero">Hero (Top)</option>
                      <option value="Sidebar">Sidebar</option>
                      <option value="Footer">Footer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Order</label>
                    <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-pink-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    onClick={() => setIsActive(!isActive)}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (Visible on site)</span>
                </label>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 disabled:opacity-60 rounded-xl shadow-lg shadow-pink-500/25 transition-colors flex items-center gap-2">
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {editingId ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroDisplayManager;
