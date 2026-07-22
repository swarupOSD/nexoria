import { useState } from 'react';
import { 
  ShieldAlert, Radio, Database, Droplets, PaintBucket, Search, Trash2, Shield, Activity, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400 flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-500" />
            Creator Control Panel
          </h1>
          <p className="text-amber-200/60 font-medium text-sm mt-1">Absolute power over the Nexoria platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'godmode', icon: Droplets, label: 'Aura God Mode' },
            { id: 'broadcast', icon: Radio, label: 'Global Broadcast' },
            { id: 'maintenance', icon: PaintBucket, label: 'Branding & Maint.' },
            { id: 'audit', icon: Activity, label: "God's Eye Audit" },
            { id: 'database', icon: Database, label: 'Database Ops' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 min-h-[500px]">
          
          {/* GOD MODE */}
          {activeTab === 'godmode' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Droplets className="text-blue-500"/> Aura God Mode</h2>
              <form onSubmit={handleGodMode} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Target User</label>
                  <select 
                    value={godModeTarget} 
                    onChange={e => setGodModeTarget(e.target.value)} 
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none transition-colors"
                    required
                  >
                    <option value="" disabled>Select a user...</option>
                    {allUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Set Aura Points</label>
                    <input type="number" value={godModeData.aura} onChange={e => setGodModeData({...godModeData, aura: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none" placeholder="Leave blank to skip" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-1">Set Reward Points</label>
                    <input type="number" value={godModeData.rewardPoints} onChange={e => setGodModeData({...godModeData, rewardPoints: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none" placeholder="Leave blank to skip" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Force Rank</label>
                  <select value={godModeData.auraRank} onChange={e => setGodModeData({...godModeData, auraRank: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none">
                    <option value="">Keep existing rank</option>
                    <option value="Newbie">Newbie</option>
                    <option value="Rising">Rising</option>
                    <option value="Pro">Pro</option>
                    <option value="Elite">Elite</option>
                    <option value="Legend">Legend</option>
                  </select>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Droplets className="w-4 h-4"/> Apply God Mode
                </button>
              </form>
            </div>
          )}

          {/* BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Radio className="text-rose-500"/> Global System Broadcast</h2>
              <form onSubmit={handleBroadcast} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Alert Title</label>
                  <input type="text" value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none" placeholder="SYSTEM ALERT" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Alert Message</label>
                  <textarea value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none h-32" placeholder="Message will popup for all online users..." required></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Alert Type</label>
                  <select value={broadcast.type} onChange={e => setBroadcast({...broadcast, type: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none">
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="error">Emergency (Red)</option>
                  </select>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Radio className="w-4 h-4"/> Send Broadcast Now
                </button>
              </form>
            </div>
          )}

          {/* BRANDING & MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><PaintBucket className="text-purple-500"/> Branding & Maintenance</h2>
              <form onSubmit={handleBranding} className="space-y-6 max-w-xl">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-red-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> System Kill Switch</h3>
                      <p className="text-xs text-red-400/80 mt-1">If enabled, no one except you can access the platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={branding.maintenanceMode} onChange={e => setBranding({...branding, maintenanceMode: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-1">Force Primary Color (Hex)</label>
                  <input type="text" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none" placeholder="#8B5CF6" />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4"/> Save Settings
                </button>
              </form>
            </div>
          )}

          {/* AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-emerald-500"/> God's Eye Audit</h2>
              {isLoadingAudit ? (
                <div className="p-8 text-center text-slate-500">Scanning activity logs...</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                      <tr>
                        <th className="p-4 font-bold text-slate-600 dark:text-slate-400">Admin</th>
                        <th className="p-4 font-bold text-slate-600 dark:text-slate-400">Action</th>
                        <th className="p-4 font-bold text-slate-600 dark:text-slate-400">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {auditData?.data?.length > 0 ? auditData.data.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <img src={log.user?.profileImage || '/default-avatar.png'} alt={log.user?.name || 'User'} className="w-6 h-6 rounded-full" />
                              <span className="font-bold text-slate-900 dark:text-white">{log.user?.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">{log.user?.role}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                            {log.action} <span className="text-slate-500 text-xs">({log.module})</span>
                          </td>
                          <td className="p-4 text-slate-500 text-xs">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="p-4 text-center text-slate-500">No admin activity found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><Database className="text-indigo-500"/> Database Operations</h2>
              
              <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                <h3 className="font-bold mb-2">Export Backup</h3>
                <p className="text-sm text-slate-500 mb-4">Download a full JSON backup of critical collections (Users, Posts, Settings).</p>
                <button onClick={handleBackup} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Database className="w-4 h-4"/> Download JSON Backup
                </button>
              </div>

              <div className="p-6 border border-red-500/30 rounded-2xl bg-red-500/5">
                <h3 className="font-bold text-red-500 flex items-center gap-2 mb-2"><Trash2 className="w-4 h-4"/> Permanent Wipe</h3>
                <p className="text-sm text-red-400/80 mb-4">Select collections to permanently wipe. This cannot be reversed.</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wipeCollections.chatmessages} onChange={e => setWipeCollections({...wipeCollections, chatmessages: e.target.checked})} className="accent-red-500 w-4 h-4" />
                    <span className="text-sm font-bold">Chat History</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wipeCollections.useractivities} onChange={e => setWipeCollections({...wipeCollections, useractivities: e.target.checked})} className="accent-red-500 w-4 h-4" />
                    <span className="text-sm font-bold">Activity Logs</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={wipeCollections.notifications} onChange={e => setWipeCollections({...wipeCollections, notifications: e.target.checked})} className="accent-red-500 w-4 h-4" />
                    <span className="text-sm font-bold">Notifications</span>
                  </label>
                </div>
                
                <button onClick={handleWipe} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Trash2 className="w-4 h-4"/> Execute Wipe
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatorControlPanel;
