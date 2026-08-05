import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Terminal, Server, Code, ShieldCheck } from 'lucide-react';
import { 
  useGetAdminHackingToolsQuery, 
  useCreateHackingToolMutation, 
  useUpdateHackingToolMutation, 
  useDeleteHackingToolMutation 
} from "../../features/hacking/hackingApiSlice";
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

// Pre-defined icons that can be used
const iconMap = {
  TerminalIcon: Terminal,
  ServerIcon: Server,
  CodeBracketIcon: Code,
  ShieldCheckIcon: ShieldCheck,
};

const EthicalHackingManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('TerminalIcon');
  const [color, setColor] = useState('from-emerald-500/20 to-emerald-900/20');
  const [border, setBorder] = useState('border-emerald-500/30');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  const { data: toolsData, isLoading, refetch } = useGetAdminHackingToolsQuery();
  const [createTool, { isLoading: isCreating }] = useCreateHackingToolMutation();
  const [updateTool, { isLoading: isUpdating }] = useUpdateHackingToolMutation();
  const [deleteTool] = useDeleteHackingToolMutation();

  const tools = toolsData?.data || [];

  const handleOpenModal = (tool = null) => {
    setEditingTool(tool);
    setTitle(tool ? tool.title : '');
    setDescription(tool ? tool.description : '');
    setIcon(tool ? tool.icon : 'TerminalIcon');
    setColor(tool ? tool.color : 'from-emerald-500/20 to-emerald-900/20');
    setBorder(tool ? tool.border : 'border-emerald-500/30');
    setIsActive(tool ? tool.isActive : true);
    setOrder(tool ? tool.order : 0);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const toolData = { title, description, icon, color, border, isActive, order };
      
      if (editingTool) {
        await updateTool({ id: editingTool._id, ...toolData }).unwrap();
        toast.success('Tool updated successfully');
      } else {
        await createTool(toolData).unwrap();
        toast.success('Tool created successfully');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (await window.appConfirm('Are you sure you want to delete this tool?')) {
      try {
        await deleteTool(id).unwrap();
        toast.success('Tool deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Delete failed');
      }
    }
  };

  // Preview component
  const PreviewCard = () => {
    const IconComponent = iconMap[icon] || Terminal;
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-[#0f0f0f] border hover:${border} transition-colors duration-500 p-6`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 transition-opacity duration-500`}></div>
        <div className="relative z-10">
          <div className={`w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 border border-gray-800 ${border}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title || 'Tool Title'}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {description || 'Tool description preview goes here...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <Helmet>
        <title>Ethical Hacking Manager - Admin</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Hacking Tools</h1>
            <p className="text-sm font-medium text-slate-500">Manage Ethical Hacking section content</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add New Tool
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 dark:text-slate-400">
                <th className="py-4 px-4">Title</th>
                <th className="py-4 px-4">Icon / Color</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Order</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">Loading tools...</td>
                </tr>
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-xl">No tools found. Add some!</td>
                </tr>
              ) : (
                tools.map(tool => (
                  <tr key={tool._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-white">
                      {tool.title}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{tool.icon}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${tool.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {tool.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono">{tool.order}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(tool)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tool._id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingTool ? 'Edit Tool' : 'Add New Tool'}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form */}
                  <form id="toolForm" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="3" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Icon Name</label>
                        <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none">
                          <option value="TerminalIcon">Terminal</option>
                          <option value="ServerIcon">Server</option>
                          <option value="CodeBracketIcon">CodeBracket</option>
                          <option value="ShieldCheckIcon">ShieldCheck</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Order</label>
                        <input type="number" value={order} onChange={e => setOrder(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Gradient Colors (Tailwind classes)</label>
                      <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="from-emerald-500/20 to-emerald-900/20" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white font-mono text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Border Colors (Tailwind classes)</label>
                      <input type="text" value={border} onChange={e => setBorder(e.target.value)} placeholder="border-emerald-500/30" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-white font-mono text-xs focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                      <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">Is Active</label>
                    </div>
                  </form>

                  {/* Preview Section */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Live Preview (Cyberpunk UI)</label>
                    <div className="p-4 bg-[#050505] rounded-3xl border border-gray-800">
                      <PreviewCard />
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <strong>Tips:</strong> Use colors like <code>from-emerald-500/20 to-emerald-900/20</code> for green, <code>from-purple-500/20 to-purple-900/20</code> for purple.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="toolForm" disabled={isCreating || isUpdating} className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isCreating || isUpdating ? 'Saving...' : 'Save Tool'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EthicalHackingManager;
