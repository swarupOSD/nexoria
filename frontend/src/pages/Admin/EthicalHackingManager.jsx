import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Terminal, Server, Code, ShieldCheck, Search, Activity, Cpu } from 'lucide-react';
import { 
  useGetAdminHackingToolsQuery, 
  useCreateHackingToolMutation, 
  useUpdateHackingToolMutation, 
  useDeleteHackingToolMutation 
} from "../../features/hacking/hackingApiSlice";
import { toast } from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const iconMap = {
  TerminalIcon: Terminal,
  ServerIcon: Server,
  CodeBracketIcon: Code,
  ShieldCheckIcon: ShieldCheck,
};

const EthicalHackingManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = tools.filter(t => t.isActive).length;

  const handleOpenModal = (tool = null) => {
    setEditingTool(tool);
    setTitle(tool ? tool.title : '');
    setDescription(tool ? tool.description : '');
    setIcon(tool ? tool.icon : 'TerminalIcon');
    setColor(tool ? tool.color : 'from-emerald-500/20 to-emerald-900/20');
    setBorder(tool ? tool.border : 'border-emerald-500/30');
    setIsActive(tool ? tool.isActive : true);
    setOrder(tool ? tool.order : tools.length * 10);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const toolData = { title, description, icon, color, border, isActive, order: Number(order) };
      
      if (editingTool) {
        await updateTool({ id: editingTool._id, ...toolData }).unwrap();
        toast.success('System module updated');
      } else {
        await createTool(toolData).unwrap();
        toast.success('New system module deployed');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Deployment failed');
    }
  };

  const handleDelete = async (id) => {
    if (await window.appConfirm('WARNING: Are you sure you want to permanently delete this module?')) {
      try {
        await deleteTool(id).unwrap();
        toast.success('Module successfully purged');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Purge sequence failed');
      }
    }
  };

  // Preview component
  const PreviewCard = () => {
    const IconComponent = iconMap[icon] || Terminal;
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-[#0a0a0a] border ${border} transition-colors duration-500 p-6 group h-full flex flex-col`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:${border} transition-colors duration-300`}>
              <IconComponent className={`w-6 h-6 ${color.includes('emerald') ? 'text-emerald-400' : color.includes('purple') ? 'text-purple-400' : color.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
            </div>
          </div>
          <h3 className="text-xl font-['Fira_Code'] font-bold text-white mb-2 tracking-tight">{title || 'Module_Name'}</h3>
          <p className="text-gray-400 font-['Fira_Sans'] text-sm leading-relaxed flex-1">
            {description || 'System module description will appear here...'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-['Fira_Sans'] selection:bg-emerald-500/30 pb-20">
      <Helmet>
        <title>Ethical Hacking Terminal - Admin</title>
      </Helmet>
      
      {/* Dynamic Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCAwTDQgMEw0IDFMMSAxWiIgZmlsbD0iIzIyMiIvPgo8L3N2Zz4=')]"></div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-6">
            <BackButton className="bg-white/5 hover:bg-white/10 text-white border border-white/10" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-['Fira_Code'] font-medium text-emerald-400 tracking-wider">SYSTEM_ONLINE</span>
              </div>
              <h1 className="text-4xl font-['Fira_Code'] font-bold text-white tracking-tight flex items-center gap-3">
                <Terminal className="w-8 h-8 text-emerald-400" />
                Root Access
              </h1>
              <p className="text-slate-400 mt-2 font-['Fira_Sans'] max-w-xl">Configure and deploy Ethical Hacking modules for the frontend grid.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search modules..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-['Fira_Code'] text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-[#020617] px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95 font-['Fira_Code'] font-bold text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Deploy New
            </button>
          </div>
        </div>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-['Fira_Code']">Total_Modules</p>
              <p className="text-3xl font-bold text-white mt-1">{tools.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-['Fira_Code']">Active_Nodes</p>
              <p className="text-3xl font-bold text-white mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-['Fira_Code']">System_Load</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">24<span className="text-sm text-slate-500">%</span></p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Cpu className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Grid Showcase */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-emerald-500 font-['Fira_Code'] text-sm animate-pulse">Establishing connection...</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="bg-[#0F172A] border border-white/5 rounded-3xl p-12 text-center">
            <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-['Fira_Code'] font-bold text-white mb-2">No modules found</h3>
            <p className="text-slate-400 max-w-md mx-auto">Your grid is empty or no modules match your search. Deploy a new module to populate the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const IconComponent = iconMap[tool.icon] || Terminal;
              return (
                <div 
                  key={tool._id} 
                  className={`group relative overflow-hidden rounded-2xl bg-[#0F172A] border ${tool.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 flex flex-col h-full`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <span className="font-['Fira_Code'] text-[10px] uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Ord:{tool.order}</span>
                    <div className={`w-2 h-2 rounded-full ${tool.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                  
                  <div className="p-6 relative z-10 flex-1 flex flex-col">
                    <div className={`w-12 h-12 bg-[#020617] rounded-xl flex items-center justify-center mb-5 border border-white/5 group-hover:${tool.border} transition-colors duration-300`}>
                      <IconComponent className={`w-5 h-5 ${tool.color.includes('emerald') ? 'text-emerald-400' : tool.color.includes('purple') ? 'text-purple-400' : tool.color.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
                    </div>
                    
                    <h3 className="text-xl font-['Fira_Code'] font-bold text-white mb-3">{tool.title}</h3>
                    <p className="text-slate-400 font-['Fira_Sans'] text-sm leading-relaxed mb-6 flex-1">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                      <button 
                        onClick={() => handleOpenModal(tool)} 
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-['Fira_Code'] text-xs uppercase tracking-wider"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Configure
                      </button>
                      <button 
                        onClick={() => handleDelete(tool._id)} 
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Purge Module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleCloseModal} 
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]"
            >
              
              <div className="flex justify-between items-center p-5 border-b border-white/10 shrink-0 bg-[#020617]/50">
                <h3 className="text-lg font-['Fira_Code'] font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  {editingTool ? 'RECONFIGURE_MODULE' : 'DEPLOY_NEW_MODULE'}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Form Section */}
                  <div className="lg:col-span-7 space-y-5">
                    <form id="hackerForm" onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400">Module_Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-['Fira_Sans']" placeholder="e.g. Penetration Testing" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400">Description_Payload</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="4" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-['Fira_Sans'] resize-none" placeholder="Enter module details..."></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400">Icon_Class</label>
                          <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none font-['Fira_Code'] text-sm">
                            <option value="TerminalIcon">Terminal</option>
                            <option value="ServerIcon">Server</option>
                            <option value="CodeBracketIcon">CodeBracket</option>
                            <option value="ShieldCheckIcon">ShieldCheck</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400">Sequence_Order</label>
                          <input type="number" value={order} onChange={e => setOrder(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none font-['Fira_Code'] text-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>Gradient_Vector</span>
                          <span className="text-[10px] text-slate-500">Tailwind Classes</span>
                        </label>
                        <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="from-emerald-500/20 to-emerald-900/20" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-['Fira_Code'] text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>Border_Matrix</span>
                          <span className="text-[10px] text-slate-500">Tailwind Classes</span>
                        </label>
                        <input type="text" value={border} onChange={e => setBorder(e.target.value)} placeholder="border-emerald-500/30" className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-['Fira_Code'] text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none" />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                          <div className="relative">
                            <input type="checkbox" className="sr-only" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                            <div className={`block w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                          <span className={`font-['Fira_Code'] text-sm font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isActive ? 'STATUS: ACTIVE' : 'STATUS: OFFLINE'}
                          </span>
                        </label>
                      </div>
                    </form>
                  </div>

                  {/* Preview Section */}
                  <div className="lg:col-span-5">
                    <div className="sticky top-0 space-y-4">
                      <label className="block text-xs font-['Fira_Code'] uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        Live_Preview_Render
                      </label>
                      <div className="h-64">
                        <PreviewCard />
                      </div>
                      
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 mt-6">
                        <h4 className="font-['Fira_Code'] text-xs text-emerald-400 mb-2 font-bold uppercase">Design_Guidelines</h4>
                        <ul className="text-slate-400 text-xs font-['Fira_Sans'] space-y-2">
                          <li>• Use <code className="text-emerald-300 bg-emerald-500/10 px-1 rounded">emerald</code> classes for positive/safe tools.</li>
                          <li>• Use <code className="text-purple-300 bg-purple-500/10 px-1 rounded">purple</code> or <code className="text-red-300 bg-red-500/10 px-1 rounded">red</code> for offensive/danger tools.</li>
                          <li>• Keep descriptions concise and technical.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>

              <div className="p-5 border-t border-white/10 shrink-0 bg-[#020617]/50 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl font-['Fira_Code'] font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  ABORT
                </button>
                <button type="submit" form="hackerForm" disabled={isCreating || isUpdating} className="px-6 py-2.5 rounded-xl font-['Fira_Code'] font-bold text-sm text-[#020617] bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  {isCreating || isUpdating ? (
                    <><div className="w-4 h-4 border-2 border-[#020617] border-t-transparent rounded-full animate-spin"></div> EXECUTING...</>
                  ) : (
                    <><Terminal className="w-4 h-4" /> COMMIT_CHANGES</>
                  )}
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
