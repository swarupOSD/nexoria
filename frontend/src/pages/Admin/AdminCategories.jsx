import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Loader2 , LayoutTemplate } from 'lucide-react';
import { 
  useGetAllCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from "../../features/category/categoryApiSlice";
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);
  const [parentCategory, setParentCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [banner, setBanner] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('Public');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: categoriesData, isLoading, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = categoriesData?.data || [];

  const handleOpenModal = (cat = null) => {
    setEditingCat(cat);
    setName(cat ? cat.name : '');
    setSlug(cat ? cat.slug : '');
    setIcon(cat && cat.icon ? cat.icon : '');
    setImage(cat && cat.image ? cat.image : '');
    setOrder(cat ? cat.order : 0);
    setParentCategory(cat && cat.parentCategory ? cat.parentCategory._id : '');
    setIsActive(cat ? cat.isActive : true);
    setBanner(cat && cat.banner ? cat.banner : '');
    setDescription(cat && cat.description ? cat.description : '');
    setVisibility(cat && cat.visibility ? cat.visibility : 'Public');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
    setName('');
    setSlug('');
    setIcon('');
    setImage('');
    setOrder(0);
    setParentCategory('');
    setIsActive(true);
    setBanner('');
    setDescription('');
    setVisibility('Public');
    setErrorMsg('');
  };

  const handleSubmit = async (e, closeAfterSave = true) => {
    if (e) e.preventDefault();
    const data = { 
      name, slug, icon, image, order, isActive, banner, description, visibility,
      parentCategory: parentCategory || null 
    };

    try {
      if (editingCat) {
        await updateCategory({ id: editingCat._id, ...data }).unwrap();
        toast.success(closeAfterSave ? 'Category updated' : 'Changes applied successfully');
      } else {
        await createCategory(data).unwrap();
        toast.success(closeAfterSave ? 'Category created' : 'Changes applied successfully');
      }
      if (closeAfterSave) {
        handleCloseModal();
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Categories - Admin Panel</title>
      </Helmet>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Categories
            </h1>
            <p className="text-slate-500 text-sm mt-1">Organize your content with categories.</p>
          </div>
        </div>
      </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all w-max"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* Table Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Parent</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Posts</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No categories found.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-semibold dark:text-white flex items-center gap-2">
                    {cat.icon && <span className={cat.icon}></span>}
                    {cat.image && <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded object-cover" />}
                    {cat.name}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">/{cat.slug}</td>
                  <td className="p-4 text-sm dark:text-slate-400">{cat.parentCategory ? cat.parentCategory.name : '-'}</td>
                  <td className="p-4 text-sm dark:text-slate-400">{cat.order}</td>
                  <td className="p-4 text-sm font-medium dark:text-slate-300">{cat.postCount || 0}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card relative w-full max-w-md p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">
                  {editingCat ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, true)}>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Category Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tools"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Slug</label>
                  <input 
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. tools"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Short Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Explore the best tools for your creative journey..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Icon Class/URL</label>
                    <input 
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="e.g. text-blue-500"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Order</label>
                    <input 
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Image URL</label>
                  <input 
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Parent Category (Optional)</label>
                  <select 
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c._id !== editingCat?._id).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Banner URL</label>
                    <input 
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Visibility</label>
                    <select 
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Public">Public</option>
                      <option value="Premium Only">Premium Only</option>
                      <option value="Hidden">Hidden</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium dark:text-slate-300">Active (Visible)</label>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  {editingCat && (
                    <button 
                      type="button" 
                      disabled={isCreating || isUpdating}
                      onClick={(e) => handleSubmit(e, false)}
                      className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-800 rounded-lg transition disabled:opacity-50"
                    >
                      Apply Changes
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {isCreating || isUpdating ? 'Saving...' : 'Save & Close'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
