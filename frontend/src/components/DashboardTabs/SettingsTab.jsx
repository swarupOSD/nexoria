import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Palette, Shield, LogOut, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLogoutMutation, useUpdateProfileMutation } from '../../features/auth/authApiSlice';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { useSubscribeToPushMutation } from '../../features/user/userApiSlice';
import { toast } from 'react-hot-toast';
import PremiumCustomization from '../PremiumCustomization';

const SettingsTab = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [subscribeToPush] = useSubscribeToPushMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window && navigator.serviceWorker) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handlePushToggle = async (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setPushEnabled(false);
      return; // Web Push unsubscription is complex, we just stop showing them locally
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const publicVapidKey = 'BM_qXoG-H3pLd7l561n9yXw0X_6W2R2G-y9-XyYvL8X5LhA8nN9eLq8Z2r5f_7T1D9n6s5F-X5XvHqX2v-L5Q3c';
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }

      await subscribeToPush({ subscription }).unwrap();
      setPushEnabled(true);
      toast.success('Push notifications enabled!');
    } catch (err) {
      console.error('Push Error:', err);
      toast.error('Failed to enable push notifications');
      setPushEnabled(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Security & Authentication
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="font-bold dark:text-white">Change Password</p>
              <p className="text-sm text-slate-500">Update your account password securely.</p>
            </div>
            <Link to="/change-password" className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold transition whitespace-nowrap text-center">
              Update Password
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" /> Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="font-bold dark:text-white flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500"/> Website Language</p>
              <p className="text-sm text-slate-500">Translate the entire website automatically.</p>
            </div>
            <select 
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm outline-none cursor-pointer transition-colors"
              onChange={(e) => {
                const select = document.querySelector(".goog-te-combo");
                if (select) {
                  select.value = e.target.value;
                  select.dispatchEvent(new Event("change"));
                }
              }}
            >
              <option value="en">English (Default)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="font-bold dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-500">Toggle dark mode appearance.</p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
              System Default
            </div>
          </div>
          <PremiumCustomization />
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="font-bold dark:text-white flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500"/> Push Notifications</p>
              <p className="text-sm text-slate-500">Get instant alerts for new games & apps.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={pushEnabled} onChange={handlePushToggle} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-l-4 border-l-red-500">
        <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2 text-red-500">
          <Shield className="w-5 h-5" /> Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
            <div>
              <p className="font-bold text-red-600 dark:text-red-400">Logout</p>
              <p className="text-sm text-red-500/80">End your current session securely.</p>
            </div>
            <button onClick={handleLogout} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsTab;
