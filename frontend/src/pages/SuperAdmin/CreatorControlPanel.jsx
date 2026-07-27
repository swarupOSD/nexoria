import { useState } from 'react';
import { 
  ShieldAlert, Radio, Database, Droplets, PaintBucket, Trash2, Shield, Activity, Save,
  CheckCircle2, AlertTriangle, Info, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetAuditLogsQuery, 
  useUpdateAuraGodModeMutation, 
  useLazyDatabaseBackupQuery, 
  useDatabaseWipeMutation, 
  useOverrideBrandingMutation, 
  useSystemBroadcastMutation 
} from '../../features/creator/creatorApiSlice';
import { useGetUsersQuery } from '../../features/user/userApiSlice';

const CreatorControlPanel = () => {
  const [activeTab, setActiveTab] = useState('godmode');
  
  // Queries & Mutations
  const { data: usersRes } = useGetUsersQuery();
  const allUsers = usersRes?.data || [];
  const { data: auditData, isLoading: isLoadingAudit } = useGetAuditLogsQuery(undefined, { skip: activeTab !== 'audit' });
  const [updateGodMode] = useUpdateAuraGodModeMutation();
  const [triggerBackup] = useLazyDatabaseBackupQuery();
  const [wipeDatabase] = useDatabaseWipeMutation();
  const [overrideBranding] = useOverrideBrandingMutation();
  const [sendBroadcast] = useSystemBroadcastMutation();

  // States
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'info' });
  const [godModeTarget, setGodModeTarget] = useState('');
  const [godModeData, setGodModeData] = useState({ aura: '', rewardPoints: '', auraRank: '' });
  const [branding, setBranding] = useState({ primaryColor: '', maintenanceMode: false });
  const [wipeCollections, setWipeCollections] = useState({ chatmessages: false, useractivities: false, notifications: false });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.message) return toast.error('Message is required');
    try {
      await sendBroadcast(broadcast).unwrap();
      toast.success('Global broadcast sent successfully!');
      setBroadcast({ title: '', message: '', type: 'info' });
    } catch (err) {
      toast.error('Failed to send broadcast');
    }
  };

  const handleGodMode = async (e) => {
    e.preventDefault();
    if (!godModeTarget) return toast.error('User ID required');
    try {
      const payload = {};
      if (godModeData.aura) payload.aura = Number(godModeData.aura);
      if (godModeData.rewardPoints) payload.rewardPoints = Number(godModeData.rewardPoints);
      if (godModeData.auraRank) payload.auraRank = godModeData.auraRank;

      await updateGodMode({ userId: godModeTarget, data: payload }).unwrap();
      toast.success('User updated with God Mode!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  const handleBackup = async () => {
    try {
      toast.loading('Generating backup...', { id: 'backup' });
      const res = await triggerBackup().unwrap();
      
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexoria_backup_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Backup downloaded!', { id: 'backup' });
    } catch (err) {
      toast.error('Backup failed', { id: 'backup' });
    }
  };

  const handleWipe = async () => {
    const selected = Object.keys(wipeCollections).filter(k => wipeCollections[k]);
    if (selected.length === 0) return toast.error('Select at least one collection');
    
    if (window.confirm(`Are you absolutely sure you want to wipe: ${selected.join(', ')}? This cannot be undone!`)) {
      try {
        await wipeDatabase(selected).unwrap();
        toast.success('Selected collections wiped permanently!');
        setWipeCollections({ chatmessages: false, useractivities: false, notifications: false });
      } catch (err) {
        toast.error('Wipe failed');
      }
    }
  };

  const handleBranding = async (e) => {
    e.preventDefault();
    try {
      await overrideBranding(branding).unwrap();
      toast.success('Branding & Maintenance settings updated globally!');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const tabs = [
    { id: 'godmode', icon: Droplets, label: 'Aura God Mode', color: 'text-blue-400' },
    { id: 'broadcast', icon: Radio, label: 'Global Broadcast', color: 'text-rose-400' },
    { id: 'maintenance', icon: PaintBucket, label: 'Branding', color: 'text-purple-400' },
    { id: 'audit', icon: Activity, label: "God's Eye", color: 'text-emerald-400' },
    { id: 'database', icon: Database, label: 'Database', color: 'text-indigo-400' },
  ];

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-20">
      {/* Sleek Compact Header */}
      <div className="flex items-center justify-between p-4 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Creator Control
            </h1>
            <p className="text-xs text-amber-500/60 font-medium">Absolute power over Nexoria</p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs (Mobile App Style) */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white border border-white/20 shadow-lg' 
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-slate-500'}`} /> 
            {tab.label}
          </button>
        ))}
      </div>

      {/* Glassmorphic Content Area */}
      <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 sm:p-6 min-h-[400px] shadow-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="enter"
            exit="exit"
            className="w-full h-full"
          >
            
            {/* GOD MODE */}
            {activeTab === 'godmode' && (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="text-center mb-6">
                  <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
                  <h2 className="text-xl font-bold text-white">Aura God Mode</h2>
                  <p className="text-xs text-slate-400">Modify user stats directly</p>
                </div>
                
                <form onSubmit={handleGodMode} className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Target User</label>
                      <select 
                        value={godModeTarget} 
                        onChange={e => setGodModeTarget(e.target.value)} 
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                        required
                      >
                        <option value="" disabled>Select a user to modify...</option>
                        {allUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Aura Points</label>
                        <input type="number" value={godModeData.aura} onChange={e => setGodModeData({...godModeData, aura: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600" placeholder="Skip" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Reward Pts</label>
                        <input type="number" value={godModeData.rewardPoints} onChange={e => setGodModeData({...godModeData, rewardPoints: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600" placeholder="Skip" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Force Rank</label>
                      <select value={godModeData.auraRank} onChange={e => setGodModeData({...godModeData, auraRank: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                        <option value="">Keep existing rank</option>
                        <option value="Newbie">Newbie</option>
                        <option value="Rising">Rising</option>
                        <option value="Pro">Pro</option>
                        <option value="Elite">Elite</option>
                        <option value="Legend">Legend</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                    <Zap className="w-5 h-5"/> Engage God Mode
                  </button>
                </form>
              </div>
            )}

            {/* BROADCAST */}
            {activeTab === 'broadcast' && (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="text-center mb-6">
                  <Radio className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-80" />
                  <h2 className="text-xl font-bold text-white">Global Broadcast</h2>
                  <p className="text-xs text-slate-400">Send an instant alert to all users</p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    
                    {/* Visual Radio Group for Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">Alert Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'info', icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
                          { id: 'warning', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
                          { id: 'error', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' }
                        ].map(type => (
                          <div 
                            key={type.id}
                            onClick={() => setBroadcast({...broadcast, type: type.id})}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl cursor-pointer transition-all border ${broadcast.type === type.id ? `${type.bg} ${type.border}` : 'bg-[#111] border-white/5 opacity-50 hover:opacity-100'}`}
                          >
                            <type.icon className={`w-5 h-5 ${type.color}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${type.color}`}>{type.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Alert Title</label>
                      <input type="text" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 outline-none transition-colors placeholder:text-slate-600" placeholder="SYSTEM UPDATE" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wider">Message Content</label>
                      <textarea value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-rose-500 outline-none transition-colors placeholder:text-slate-600 h-28 resize-none" placeholder="Type your message here..." required></textarea>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20">
                    <Radio className="w-5 h-5"/> Send Broadcast Now
                  </button>
                </form>
              </div>
            )}

            {/* BRANDING & MAINTENANCE */}
            {activeTab === 'maintenance' && (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="text-center mb-6">
                  <PaintBucket className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-80" />
                  <h2 className="text-xl font-bold text-white">Branding & System</h2>
                  <p className="text-xs text-slate-400">Core platform aesthetics and locks</p>
                </div>

                <form onSubmit={handleBranding} className="space-y-4">
                  {/* iOS Style Kill Switch */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-red-500 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> System Kill Switch</h3>
                      <p className="text-xs text-red-400/70 mt-1 max-w-[200px] sm:max-w-none">Lock out everyone except creators.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={branding.maintenanceMode} onChange={e => setBranding({...branding, maintenanceMode: e.target.checked})} className="sr-only peer" />
                      <div className="w-14 h-7 bg-[#111] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                    </label>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">Primary Theme Color</label>
                      <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl p-2 pr-4">
                        <input 
                          type="color" 
                          value={branding.primaryColor || '#8B5CF6'} 
                          onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                        />
                        <input 
                          type="text" 
                          value={branding.primaryColor} 
                          onChange={e => setBranding({...branding, primaryColor: e.target.value})} 
                          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-600 font-mono" 
                          placeholder="#8B5CF6" 
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                    <Save className="w-5 h-5"/> Save Global Settings
                  </button>
                </form>
              </div>
            )}

            {/* AUDIT (God's Eye Feed) */}
            {activeTab === 'audit' && (
              <div className="max-w-2xl mx-auto h-full flex flex-col">
                <div className="text-center mb-6">
                  <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <h2 className="text-xl font-bold text-white">God's Eye</h2>
                  <p className="text-xs text-slate-400">Real-time admin action feed</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                  {isLoadingAudit ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Scanning matrix...</span>
                    </div>
                  ) : auditData?.data?.length > 0 ? (
                    auditData.data.map((log) => (
                      <div key={log._id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex gap-4 items-start group hover:border-emerald-500/30 transition-colors">
                        <img src={log.user?.profileImage || '/default-avatar.png'} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-white/10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm truncate">{log.user?.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase tracking-wider">{log.user?.role}</span>
                          </div>
                          <p className="text-sm text-slate-300 break-words font-medium">
                            {log.action}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                            <span className="text-emerald-500/70">{log.module}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-3 bg-[#111]/50 rounded-2xl border border-white/5 border-dashed">
                      <CheckCircle2 className="w-8 h-8 opacity-50" />
                      <p className="text-sm font-medium">No suspicious activity detected.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DATABASE */}
            {activeTab === 'database' && (
              <div className="max-w-xl mx-auto space-y-5">
                <div className="text-center mb-6">
                  <Database className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-80" />
                  <h2 className="text-xl font-bold text-white">Database Operations</h2>
                  <p className="text-xs text-slate-400">Core data manipulation</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-1">Export JSON Backup</h3>
                    <p className="text-xs text-slate-400 mb-4">Securely download critical collections (Users, Posts, Settings) to your local machine.</p>
                    <button onClick={handleBackup} className="w-full py-3 bg-[#111] hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95">
                      <Database className="w-4 h-4 text-indigo-400"/> Download Backup Now
                    </button>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                    <h3 className="font-bold text-red-500 flex items-center gap-2 mb-1"><Trash2 className="w-4 h-4"/> Permanent Wipe</h3>
                    <p className="text-xs text-red-400/70 mb-5">Select collections to permanently delete. This cannot be reversed.</p>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        { id: 'chatmessages', label: 'Chat History' },
                        { id: 'useractivities', label: 'Activity Logs' },
                        { id: 'notifications', label: 'Notifications' }
                      ].map(collection => (
                        <div key={collection.id} className="flex items-center justify-between p-3 bg-[#111] border border-red-500/10 rounded-xl">
                          <span className="text-sm font-bold text-slate-300">{collection.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={wipeCollections[collection.id]} 
                              onChange={e => setWipeCollections({...wipeCollections, [collection.id]: e.target.checked})} 
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-5 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={handleWipe} className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20">
                      <Trash2 className="w-4 h-4"/> Execute Wipe
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatorControlPanel;
