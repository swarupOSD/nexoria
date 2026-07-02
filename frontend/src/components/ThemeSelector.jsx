import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Lock, Sparkles } from 'lucide-react';
import { useUpdateThemeMutation } from '../features/user/userApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const themes = [
  { id: 'default', name: 'Nexoria Classic', color: 'from-blue-500 to-indigo-600', icon: Palette },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', color: 'from-yellow-400 to-red-500', icon: Sparkles, requiresPremium: true },
  { id: 'synthwave', name: 'Synthwave 80s', color: 'from-fuchsia-600 to-purple-600', icon: Sparkles, requiresPremium: true },
  { id: 'neon', name: 'Neon Nights', color: 'from-green-400 to-cyan-500', icon: Sparkles, requiresPremium: true },
];

const ThemeSelector = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateTheme, { isLoading }] = useUpdateThemeMutation();

  const handleThemeSelect = async (themeId) => {
    if (user.profileTheme === themeId) return;

    const themeObj = themes.find(t => t.id === themeId);
    if (themeObj?.requiresPremium && !user.isPremium && user.role !== 'superadmin' && user.role !== 'admin') {
      toast.error('This theme is for Premium or Legend members only!');
      return;
    }

    try {
      const res = await updateTheme({ theme: themeId }).unwrap();
      dispatch(setCredentials({ ...user, profileTheme: res.data }));
      toast.success('Profile theme updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update theme');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl">
          <Palette className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Profile Theme</h3>
          <p className="text-sm text-slate-400">Customize your dashboard experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((theme) => {
          const isSelected = user.profileTheme === theme.id || (!user.profileTheme && theme.id === 'default');
          const isLocked = theme.requiresPremium && !user.isPremium && user.role !== 'superadmin' && user.role !== 'admin';

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: isLocked ? 1 : 1.02 }}
              whileTap={{ scale: isLocked ? 1 : 0.98 }}
              onClick={() => handleThemeSelect(theme.id)}
              disabled={isLoading || isLocked}
              className={`relative overflow-hidden p-4 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'bg-slate-800/80 ring-2 ring-purple-500' 
                  : isLocked
                    ? 'bg-slate-800/30 opacity-75 cursor-not-allowed'
                    : 'bg-slate-800/50 hover:bg-slate-800/80 hover:ring-1 ring-slate-600'
              }`}
            >
              {/* Background Gradient for Theme preview */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${theme.color} opacity-20 blur-xl rounded-full translate-x-8 -translate-y-8`}></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.color}`}>
                    <theme.icon className="w-4 h-4 text-white" />
                  </div>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-purple-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  {isLocked && !isSelected && (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                
                <div>
                  <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {theme.name}
                  </h4>
                  {isLocked && (
                    <span className="text-xs font-medium text-amber-500 mt-1 block">
                      Premium Only
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
