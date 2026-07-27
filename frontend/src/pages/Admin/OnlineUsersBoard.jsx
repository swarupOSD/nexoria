import React, { useState, useEffect } from 'react';
import { Users, UserX, Loader2, Activity } from 'lucide-react';
import axios from 'axios';

const OnlineUsersBoard = () => {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/analytics/online-users', { withCredentials: true });
        setResponse(res.data.data);
      } catch (error) {
        console.error('Error fetching online users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const onlineUsers = response?.onlineUsers || [];
  const recentlyOffline = response?.recentlyOfflineUsers || [];

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 min-w-0 overflow-x-hidden w-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-500" />
          Live Status Board
        </h1>
        <p className="text-slate-500 mt-2">Monitor active users across the platform in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Online Now */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" /> Online Now
            </h2>
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-full text-sm">
              {onlineUsers.length} Users
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {onlineUsers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No users currently online.</p>
            ) : (
              onlineUsers.map(user => (
                <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50">
                  <div className="relative">
                    <img src={user.profileImage || '/default-avatar.png'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white truncate">{user.name || user.username}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Offline */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-500">
              <UserX className="w-6 h-6" /> Recently Offline
            </h2>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold px-3 py-1 rounded-full text-sm">
              Last 24 Hours
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {recentlyOffline.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No recently offline users.</p>
            ) : (
              recentlyOffline.map(user => (
                <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <img src={user.profileImage || '/default-avatar.png'} alt={user.username} className="w-10 h-10 rounded-full object-cover grayscale" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-400 border-2 border-white dark:border-slate-900 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{user.name || user.username}</p>
                    <p className="text-xs text-slate-500">Last seen: {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersBoard;
