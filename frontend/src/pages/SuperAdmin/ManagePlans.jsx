import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAllPlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation } from '../../features/api/planApiSlice';
import { Plus, Edit2, Trash2, X, Check , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';

const ManagePlans = () => {
  const { data: plansRes, isLoading, refetch } = useGetAllPlansQuery();
  const [createPlan] = useCreatePlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const plans = plansRes?.data || [];

  const handleOpenModal = (plan = null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this plan?')) {
      await deletePlan(id).unwrap();
      refetch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const features = formData.get('features').split(',').map(f => f.trim()).filter(f => f);
    
    const payload = {
      name: formData.get('name'),
      slug: formData.get('name').toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      durationDays: Number(formData.get('durationDays')),
      isPopular: formData.get('isPopular') === 'on',
      isActive: formData.get('isActive') === 'on',
      features,
    };

    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, ...payload }).unwrap();
      } else {
        await createPlan(payload).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error saving plan');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Plans - Super Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Premium Plans
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure subscription plans for users.</p>
          </div>
        </div>
      </div>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-semibold text-sm transition shadow-lg shadow-blue-500/30">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading plans...</p>
        ) : plans.map((plan) => (
          <motion.div key={plan._id} className="glass-card p-6 border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  {plan.name}
                  {!plan.isActive && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>}
                </h3>
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">${plan.price}</p>
                <p className="text-xs text-slate-500">{plan.durationDays === 99999 ? 'Lifetime' : `${plan.durationDays} Days`}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(plan)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded transition"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(plan._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <ul className="space-y-2 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card relative w-full max-w-lg p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Name</label>
                  <input type="text" name="name" required defaultValue={editingPlan?.name || ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Description</label>
                  <textarea name="description" required defaultValue={editingPlan?.description || ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Price (USD)</label>
                    <input type="number" name="price" step="0.01" required defaultValue={editingPlan?.price || ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Duration (Days)</label>
                    <input type="number" name="durationDays" required defaultValue={editingPlan?.durationDays || ''} placeholder="Use 99999 for Lifetime" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 dark:text-slate-300">Features (Comma separated)</label>
                  <textarea name="features" required defaultValue={editingPlan?.features?.join(', ') || ''} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 text-sm font-semibold dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" name="isPopular" defaultChecked={editingPlan?.isPopular} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    Mark as Popular
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" name="isActive" defaultChecked={editingPlan ? editingPlan.isActive : true} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    Active
                  </label>
                </div>

                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30">
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePlans;
