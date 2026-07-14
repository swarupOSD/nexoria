import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, Check, X as XIcon, UserPlus } from 'lucide-react';
import { 
  useGetFriendsListQuery, 
  useGetFriendRequestsQuery, 
  useRespondToFriendRequestMutation 
} from '../features/api/friendApiSlice';
import toast from 'react-hot-toast';

const FriendsDrawer = ({ isOpen, onClose, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const { data: friendsData, isLoading: friendsLoading } = useGetFriendsListQuery(undefined, { skip: !isOpen });
  const { data: requestsData, isLoading: requestsLoading } = useGetFriendRequestsQuery(undefined, { skip: !isOpen });
  const [respondToRequest] = useRespondToFriendRequestMutation();

  const handleRespond = async (requestId, action) => {
    try {
      await respondToRequest({ requestId, action }).unwrap();
      toast.success(action === 'accepted' ? 'Friend request accepted!' : 'Friend request rejected.');
    } catch (err) {
      toast.error('Failed to respond to request.');
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[350px] bg-[#0a0d14]/90 backdrop-blur-xl border-l border-white/10 z-[130] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Friends
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-3 gap-2 border-b border-white/10">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'friends' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                My Friends {friendsData?.data?.length > 0 && `(${friendsData.data.length})`}
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all relative ${
                  activeTab === 'requests' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                Requests
                {requestsData?.data?.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'friends' && (
                <div className="space-y-3">
                  {friendsLoading ? (
                    <div className="text-center text-slate-500 py-10">Loading friends...</div>
                  ) : friendsData?.data?.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>You have no friends yet.</p>
                      <p className="text-xs mt-1">Add friends from the Global Chat!</p>
                    </div>
                  ) : (
                    friendsData?.data?.map(friend => (
                      <div key={friend._id} className="flex items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="relative">
                          <img 
                            src={friend.profileImage.startsWith('http') ? friend.profileImage : `${import.meta.env.VITE_BACKEND_URL || ''}/uploads/${friend.profileImage}`} 
                            alt={friend.username}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0d14] rounded-full"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-white font-medium text-sm" style={{ color: friend.chatNameColor || 'white' }}>
                            {friend.name}
                          </h4>
                          <p className="text-slate-400 text-xs">@{friend.username}</p>
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenChat(friend);
                          }}
                          className="w-10 h-10 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-3">
                  {requestsLoading ? (
                    <div className="text-center text-slate-500 py-10">Loading requests...</div>
                  ) : requestsData?.data?.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No pending friend requests.</p>
                    </div>
                  ) : (
                    requestsData?.data?.map(request => (
                      <div key={request._id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center mb-3">
                          <img 
                            src={request.sender.profileImage.startsWith('http') ? request.sender.profileImage : `${import.meta.env.VITE_BACKEND_URL || ''}/uploads/${request.sender.profileImage}`} 
                            alt={request.sender.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-3 flex-1">
                            <h4 className="text-white font-medium text-sm">{request.sender.name}</h4>
                            <p className="text-slate-400 text-xs">@{request.sender.username}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(request._id, 'accepted')}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(request._id, 'rejected')}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                          >
                            <XIcon className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FriendsDrawer;
