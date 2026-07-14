import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Palette, Check, Lock, Sparkles, Type, Image } from 'lucide-react';
import { useUpdateCustomizationMutation } from '../features/user/userApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const themes = [
  { id: 'default', name: 'Nexoria Classic', color: 'from-blue-500 to-indigo-600', icon: Palette },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', color: 'from-yellow-400 to-red-500', icon: Sparkles, requiresPremium: true },
  { id: 'synthwave', name: 'Synthwave 80s', color: 'from-fuchsia-600 to-purple-600', icon: Sparkles, requiresPremium: true },
  { id: 'neon', name: 'Neon Nights', color: 'from-green-400 to-cyan-500', icon: Sparkles, requiresPremium: true },
];

const borders = [
  { id: 'none', name: 'None' },
  { id: 'fire', name: 'Blazing Fire' },
  { id: 'neon', name: 'Neon Glow' },
  { id: 'holographic', name: 'Holographic' },
  { id: 'gold', name: 'Golden Aura' },
];

const PremiumCustomization = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateCustomization, { isLoading }] = useUpdateCustomizationMutation();
  const [customColor, setCustomColor] = useState(user?.chatNameColor || '#ffffff');

  const handleCustomizationUpdate = async (type, value) => {
    const isPremium = user.isPremium || user.role === 'superadmin' || user.role === 'admin' || user.role === 'owner';
    
    if (type !== 'theme' || themes.find(t => t.id === value)?.requiresPremium) {
      if (!isPremium) {
        toast.error('This customization is for Premium or Legend members only!');
        return;
      }
    }

    try {
      const payload = { [type]: value };
      const res = await updateCustomization(payload).unwrap();
      dispatch(setCredentials({ 
        user: { ...user, ...res.data }, 
        token: user.token || localStorage.getItem('token') 
      }));
      toast.success('Customization updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update customization');
    }
  };

  const handleColorSave = () => {
    if (customColor !== user?.chatNameColor) {
      handleCustomizationUpdate('chatNameColor', customColor);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-8">
      
      {/* 1. THEME SELECTOR */}
      <div>
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
            const isLocked = theme.requiresPremium && !user.isPremium && user.role !== 'superadmin' && user.role !== 'admin' && user.role !== 'owner';

            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => handleCustomizationUpdate('theme', theme.id)}
                disabled={isLoading || isLocked}
                className={`relative overflow-hidden p-4 rounded-xl text-left transition-all ${
                  isSelected 
                    ? 'bg-slate-800/80 ring-2 ring-purple-500' 
                    : isLocked
                      ? 'bg-slate-800/30 opacity-75 cursor-not-allowed'
                      : 'bg-slate-800/50 hover:bg-slate-800/80 hover:ring-1 ring-slate-600'
                }`}
              >
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
                    {isLocked && !isSelected && <Lock className="w-4 h-4 text-slate-500" />}
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{theme.name}</h4>
                    {isLocked && <span className="text-xs font-medium text-amber-500 mt-1 block">Premium Only</span>}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 2. CHAT NAME COLOR */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
            <Type className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Chat Name Color <span className="text-xs ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">PREMIUM</span></h3>
            <p className="text-sm text-slate-400">Stand out in the Global Chat with a custom name color</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="color" 
            value={customColor} 
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-14 h-14 rounded cursor-pointer bg-transparent border-0"
          />
          <div className="flex-1 max-w-xs">
            <div className="text-sm mb-1 text-slate-400">Preview:</div>
            <div className="bg-slate-800 rounded-lg p-3">
              <span style={{ color: customColor }} className="font-bold">
                {user.name}
              </span>
              <span className="text-slate-300 ml-2">Hello, Nexoria!</span>
            </div>
          </div>
          <button 
            onClick={handleColorSave} 
            disabled={isLoading || customColor === user?.chatNameColor}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50 transition"
          >
            Save Color
          </button>
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* 3. PROFILE AVATAR BORDER */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl">
            <Image className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Avatar Border <span className="text-xs ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">PREMIUM</span></h3>
            <p className="text-sm text-slate-400">Add a glowing animated ring around your avatar in chat</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {borders.map(border => (
            <button
              key={border.id}
              onClick={() => handleCustomizationUpdate('profileBorder', border.id)}
              disabled={isLoading}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                user.profileBorder === border.id 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center
                ${border.id === 'fire' ? 'ring-2 ring-orange-500 shadow-[0_0_10px_orange]' : ''}
                ${border.id === 'neon' ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_cyan]' : ''}
                ${border.id === 'holographic' ? 'ring-2 ring-fuchsia-500 shadow-[0_0_10px_fuchsia]' : ''}
                ${border.id === 'gold' ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_yellow]' : ''}
              `}>
                <img src={user.profileImage?.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${user.profileImage}`} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className={`font-semibold ${user.profileBorder === border.id ? 'text-white' : 'text-slate-300'}`}>
                {border.name}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PremiumCustomization;
