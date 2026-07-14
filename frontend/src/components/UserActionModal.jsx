import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, MessageCircle, AlertTriangle, ShieldAlert, Crown, Star } from 'lucide-react';
import { useSendFriendRequestMutation } from '../features/api/friendApiSlice';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const UserActionModal = ({ isOpen, onClose, targetUser }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [sendFriendRequest, { isLoading }] = useSendFriendRequestMutation();
  const navigate = useNavigate();

  if (!isOpen || !targetUser) return null;

  const isMe = currentUser?._id === targetUser._id;

  const handleAddFriend = async () => {
    if (isMe) return;
    try {
      await sendFriendRequest({ receiverId: targetUser._id }).unwrap();
      toast.success('Friend request sent!');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send request');
    }
  };

  const handleMessage = () => {
    onClose();
    // Dispatch a custom event to open the DM widget in Navbar
    const event = new CustomEvent('openPrivateChat', { detail: targetUser });
    window.dispatchEvent(event);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 z-[200] shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <img 
                src={targetUser.profileImage?.startsWith('http') ? targetUser.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${targetUser.profileImage || 'default.jpg'}`}
                alt="Avatar" 
                className={`w-24 h-24 rounded-full object-cover mb-4 ${
                  targetUser.profileBorder === 'fire' ? 'ring-4 ring-orange-500 shadow-[0_0_15px_orange]' :
                  targetUser.profileBorder === 'neon' ? 'ring-4 ring-cyan-400 shadow-[0_0_20px_cyan]' :
                  targetUser.profileBorder === 'holographic' ? 'ring-4 ring-fuchsia-500 shadow-[0_0_15px_fuchsia]' :
                  targetUser.profileBorder === 'gold' ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_yellow]' : 'ring-4 ring-slate-800'
                }`}
              />
              <h3 
                className="text-xl font-bold text-white flex items-center gap-2"
                style={targetUser.chatNameColor ? { color: targetUser.chatNameColor, textShadow: `0 0 10px ${targetUser.chatNameColor}80` } : {}}
              >
                {targetUser.name}
                {targetUser.role === 'owner' && <Crown className="w-5 h-5 text-amber-500" />}
                {targetUser.isPremium && targetUser.role === 'user' && <Star className="w-4 h-4 text-amber-400" />}
              </h3>
              <p className="text-slate-400 text-sm">@{targetUser.username}</p>
              
              <div className="mt-2 text-xs font-semibold px-2 py-1 bg-slate-800 rounded text-slate-300">
                Rank: {targetUser.auraRank || 'Rookie'}
              </div>
            </div>

            {!isMe && (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAddFriend}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 rounded-xl text-white font-bold transition-all"
                >
                  <UserPlus className="w-5 h-5" /> Add Friend
                </button>
                <button 
                  onClick={handleMessage}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold transition-all border border-slate-700"
                >
                  <MessageCircle className="w-5 h-5" /> Direct Message
                </button>
                
                {/* Moderation section if current user is admin/owner */}
                {(currentUser?.role === 'owner' || currentUser?.role === 'superadmin' || currentUser?.role === 'admin') && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                    <p className="text-xs text-slate-500 uppercase font-bold text-center mb-1">Moderator Actions</p>
                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl font-bold transition-all border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4" /> Warn User
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-xl font-bold transition-all border border-orange-500/20">
                      <ShieldAlert className="w-4 h-4" /> Suspend
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserActionModal;
