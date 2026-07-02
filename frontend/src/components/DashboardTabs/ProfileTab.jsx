import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Star, Crown, Image as ImageIcon, CheckCircle, XCircle, MessageSquare, Video, Send, Globe, Disc, Camera } from 'lucide-react';
import FallbackImage from '../FallbackImage';
import ImageCropper from '../ImageCropper';
import { useUpdateProfileMutation } from '../../features/auth/authApiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';

const ProfileTab = ({ user, token, refetchUser }) => {
  const dispatch = useDispatch();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    genderIdentity: user?.genderIdentity || 'Not specified',
    socialLinks: {
      telegram: user?.socialLinks?.telegram || '',
      whatsapp: user?.socialLinks?.whatsapp || '',
      youtube: user?.socialLinks?.youtube || '',
      discord: user?.socialLinks?.discord || '',
      website: user?.socialLinks?.website || '',
    }
  });

  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [coverBanner, setCoverBanner] = useState(user?.coverBanner || '');

  const [cropType, setCropType] = useState(null); // 'avatar' | 'banner' | null
  const [tempImageSrc, setTempImageSrc] = useState(null);

  // File selection for cropping
  const onFileChange = async (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setTempImageSrc(imageDataUrl);
      setCropType(type);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleCropComplete = (croppedImageBase64) => {
    if (cropType === 'avatar') {
      setProfileImage(croppedImageBase64);
    } else if (cropType === 'banner') {
      setCoverBanner(croppedImageBase64);
    }
    setCropType(null);
    setTempImageSrc(null);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        genderIdentity: formData.genderIdentity,
        socialLinks: formData.socialLinks,
      };

      // Helper function to upload base64 to server and get URL
      const uploadBase64 = async (base64Str) => {
        const res = await fetch(base64Str);
        const blob = await res.blob();
        const fd = new FormData();
        fd.append('image', blob, 'image.jpg');
        
        const uploadRes = await fetch('/api/upload/profile', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        
        const data = await uploadRes.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        return data.url;
      };

      if (profileImage !== user?.profileImage) {
        payload.profileImage = profileImage.startsWith('data:image') 
          ? await uploadBase64(profileImage) 
          : profileImage;
      }

      if (coverBanner !== user?.coverBanner) {
        payload.coverBanner = coverBanner.startsWith('data:image') 
          ? await uploadBase64(coverBanner) 
          : coverBanner;
      }

      const response = await updateProfile(payload).unwrap();
      dispatch(setCredentials({ user: response.user, token }));
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refetchUser();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.username) score += 20;
    if (user?.bio) score += 20;
    if (user?.profileImage && user?.profileImage !== 'default.jpg') score += 20;
    if (user?.coverBanner) score += 20;
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden rounded-2xl relative border-none shadow-2xl">
        <div className="h-48 md:h-64 relative bg-slate-200 dark:bg-slate-800 w-full group">
          {coverBanner ? (
            <img src={coverBanner} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/40 to-accent/40" />
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 transition">
                <ImageIcon className="w-5 h-5" /> Change Cover
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 'banner')} />
              </label>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20">
            <div className="relative group">
              <FallbackImage 
                src={profileImage} 
                fallbackType="avatar" 
                alt={user?.name} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover bg-white" 
              />
              {user?.isPremium && (
                <div className="absolute bottom-2 right-2 bg-gradient-to-tr from-amber-400 to-yellow-500 p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer text-white flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Edit</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 'avatar')} />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                {user?.name}
                {user?.role === 'superadmin' && <Shield className="w-5 h-5 text-rose-500" />}
              </h1>
              <p className="text-primary font-medium">@{user?.username || 'username'}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold capitalize flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" /> {user?.role}
                </span>
                {user?.isPremium && (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" /> {user?.role === 'superadmin' ? 'Lifetime Premium Administrator' : 'Premium'}
                  </span>
                )}
              </div>
            </div>

            <div className="md:mb-4 w-full md:w-auto">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 md:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold transition">
                    Cancel
                  </button>
                  <button onClick={handleUpdate} disabled={isUpdating} className="flex-1 md:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition disabled:opacity-50 flex justify-center items-center">
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Personal Information</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="premium-input w-full" />
                  ) : (
                    <p className="font-bold dark:text-white">{user?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">Username</label>
                  {isEditing ? (
                    <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="premium-input w-full" />
                  ) : (
                    <p className="font-bold dark:text-white">@{user?.username || 'Not set'}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">Email Address</label>
                  {isEditing ? (
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="premium-input w-full" />
                  ) : (
                    <p className="font-bold dark:text-white">{user?.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1.5">Gender / Identity</label>
                  {isEditing ? (
                    <select 
                      value={formData.genderIdentity} 
                      onChange={(e) => setFormData({...formData, genderIdentity: e.target.value})}
                      className="premium-input w-full"
                    >
                      <option value="Not specified">Prefer not to say</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Gay">Gay</option>
                      <option value="Lesbian">Lesbian</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Transgender">Transgender</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Pansexual">Pansexual</option>
                      <option value="Asexual">Asexual</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-bold dark:text-white">{user?.genderIdentity || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1.5">Bio</label>
                {isEditing ? (
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="3" className="premium-input w-full resize-none" placeholder="Tell us about yourself..." />
                ) : (
                  <p className="font-medium text-slate-600 dark:text-slate-300">{user?.bio || 'No bio provided yet.'}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { id: 'telegram', icon: Send, color: 'text-blue-500' },
                { id: 'whatsapp', icon: MessageSquare, color: 'text-green-500' },
                { id: 'youtube', icon: Video, color: 'text-red-500' },
                { id: 'discord', icon: Disc, color: 'text-indigo-500' },
                { id: 'website', icon: Globe, color: 'text-slate-500' }
              ].map(social => (
                <div key={social.id}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-1.5 capitalize">
                    <social.icon className={`w-4 h-4 ${social.color}`} /> {social.id}
                  </label>
                  {isEditing ? (
                    <input 
                      type="url" 
                      value={formData.socialLinks[social.id]} 
                      onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, [social.id]: e.target.value }})} 
                      className="premium-input w-full" 
                      placeholder={`https://`}
                    />
                  ) : (
                    formData.socialLinks[social.id] ? (
                      <a href={formData.socialLinks[social.id]} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline truncate block">
                        {formData.socialLinks[social.id]}
                      </a>
                    ) : (
                      <p className="text-slate-400 italic text-sm">Not connected</p>
                    )
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-lg font-bold dark:text-white mb-4">Profile Completion</h3>
            <div className="relative pt-1 mb-4">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                    {calculateCompletion()}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
                <div style={{ width: `${calculateCompletion()}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
              </div>
            </div>
            {calculateCompletion() < 100 && (
              <p className="text-sm text-slate-500">Complete your profile to stand out in the community!</p>
            )}
          </motion.div>

          {/* Badges & Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-lg font-bold dark:text-white mb-4">Achievements</h3>
            {user?.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.badges.includes('first_vibe') && (
                  <div className="flex flex-col items-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl" title="First Vibe - You cast your first vibe!">
                    <span className="text-2xl mb-1">🎭</span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider text-center">First Vibe</span>
                  </div>
                )}
                {user.badges.includes('aura_legend') && (
                  <div className="flex flex-col items-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)]" title="Aura Legend - 500+ Vibes Cast">
                    <span className="text-2xl mb-1">👑</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center">Legend</span>
                  </div>
                )}
                {user.badges.includes('streak_master') && (
                  <div className="flex flex-col items-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)]" title="Streak Master - 7 Day Login Streak">
                    <span className="text-2xl mb-1">🔥</span>
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-center">Streak Master</span>
                  </div>
                )}
                {user.badges.includes('music_lover') && (
                  <div className="flex flex-col items-center p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)]" title="Music Lover - Listened to 50 songs">
                    <span className="text-2xl mb-1">🎧</span>
                    <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider text-center">Music Lover</span>
                  </div>
                )}
                {user.badges.includes('app_tester') && (
                  <div className="flex flex-col items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" title="App Tester - Downloaded 10 apps">
                    <span className="text-2xl mb-1">📱</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-center">App Tester</span>
                  </div>
                )}
                {user.badges.includes('social_butterfly') && (
                  <div className="flex flex-col items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]" title="Social Butterfly - Added 5 wishlist items">
                    <span className="text-2xl mb-1">🦋</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-center">Social Butterfly</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">No badges earned yet. Keep interacting to unlock achievements!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {cropType && tempImageSrc && (
        <ImageCropper 
          imageSrc={tempImageSrc}
          onCropCompleteAction={handleCropComplete}
          onCancel={() => { setCropType(null); setTempImageSrc(null); }}
          aspectRatio={cropType === 'avatar' ? 1 : 16/9}
          shape={cropType === 'avatar' ? 'round' : 'rect'}
        />
      )}
    </div>
  );
};

export default ProfileTab;
