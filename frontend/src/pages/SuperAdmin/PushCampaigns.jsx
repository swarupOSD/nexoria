import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Clock, Calendar, Users, Smartphone, Zap , LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLaunchCampaignMutation } from '../../features/campaign/campaignApiSlice';
import BackButton from '../../components/BackButton';

const PushCampaigns = () => {
  const [launchCampaign, { isLoading: isSending }] = useLaunchCampaignMutation();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All Users',
    scheduleType: 'Now',
    scheduledTime: '',
    actionLink: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required.');
      return;
    }
    
    toast.loading('Preparing campaign...', { id: 'push' });
    
    try {
      const res = await launchCampaign(formData).unwrap();
      toast.success(res.message || 'Push notifications sent to active devices!', { id: 'push' });
      setFormData({ title: '', message: '', targetAudience: 'All Users', scheduleType: 'Now', scheduledTime: '', actionLink: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send campaign', { id: 'push' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Push Campaigns
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Engage users with direct notifications</p>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Campaign Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white dark:bg-[#111] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Notification Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. 🚀 New GTA VI Leaks Available!" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Message Body</label>
              <textarea 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                rows="3"
                placeholder="Download the latest mod menu for free now..." 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target Audience</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={formData.targetAudience}
                    onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white appearance-none"
                  >
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Users</option>
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Premium Members Only</option>
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Inactive Users (30+ days)</option>
                    <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Android Devices Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Action Link (Optional)</label>
                <input 
                  type="text" 
                  value={formData.actionLink}
                  onChange={e => setFormData({...formData, actionLink: e.target.value})}
                  placeholder="https://nexoria.com/games/gta-6" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Delivery Schedule</label>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.scheduleType === 'Now' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <input type="radio" name="schedule" value="Now" checked={formData.scheduleType === 'Now'} onChange={() => setFormData({...formData, scheduleType: 'Now'})} className="hidden" />
                  <Zap className="w-5 h-5" /> <span className="font-bold">Send Now</span>
                </label>
                
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.scheduleType === 'Later' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <input type="radio" name="schedule" value="Later" checked={formData.scheduleType === 'Later'} onChange={() => setFormData({...formData, scheduleType: 'Later'})} className="hidden" />
                  <Calendar className="w-5 h-5" /> <span className="font-bold">Schedule</span>
                </label>
              </div>
              
              {formData.scheduleType === 'Later' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <input 
                    type="datetime-local" 
                    value={formData.scheduledTime}
                    onChange={e => setFormData({...formData, scheduledTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900 dark:text-white"
                  />
                </motion.div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
            >
              {isSending ? 'Processing...' : <><Send className="w-5 h-5" /> Launch Campaign</>}
            </button>
          </form>
        </motion.div>

        {/* Live Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <div className="bg-slate-100 dark:bg-[#050505] rounded-[2.5rem] border-8 border-slate-800 dark:border-slate-800 p-4 h-[600px] relative shadow-2xl overflow-hidden flex flex-col justify-start pt-16">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
            
            <div className="text-center mb-10 text-slate-400 font-bold text-xs">Live Device Preview</div>
            
            {/* The Notification Card */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 dark:border-white/5 mx-2 flex gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Nexoria</span>
                  <span className="text-[10px] font-bold text-slate-400">now</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                  {formData.title || 'Notification Title'}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {formData.message || 'The notification body text will appear here. It usually spans two lines before truncating.'}
                </p>
              </div>
            </motion.div>

            {/* Ambient background for phone */}
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-orange-500/10 to-transparent pointer-events-none -z-10"></div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PushCampaigns;
