import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Ghost, Users, Activity, Trash2, 
  Search, RefreshCw, Palette, MessageSquare, Loader2
} from 'lucide-react';
import { 
  useGetAdminSecretRoomsQuery, 
  useDeleteAdminSecretRoomMutation 
} from '../../features/api/secretLoungeApiSlice';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const SecretLoungeManagement = () => {
  const { data: response, isLoading, refetch } = useGetAdminSecretRoomsQuery(undefined, { pollingInterval: 15000 });
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteAdminSecretRoomMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const analytics = response?.data?.analytics || { totalRooms: 0, totalUsers: 0, activeThemes: {} };
  const rooms = response?.data?.rooms || [];

  const filteredRooms = rooms.filter(room => 
    room.teamCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (teamCode) => {
    if (window.confirm(`Are you sure you want to terminate Room ${teamCode}? This will kick out all active users.`)) {
      try {
        await deleteRoom(teamCode).unwrap();
        toast.success(`Room ${teamCode} destroyed successfully.`);
      } catch (error) {
        toast.error(error.data?.message || 'Failed to destroy room.');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Ghost className="w-8 h-8 text-teal-500" />
            Secret Lounge Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitor and manage active ephemeral chat rooms. Rooms exist in memory and leave no trace.
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          title="Active Rooms" 
          value={analytics.totalRooms} 
          colorClass="bg-teal-500 text-teal-500" 
        />
        <StatCard 
          icon={Users} 
          title="Active Users" 
          value={analytics.totalUsers} 
          colorClass="bg-indigo-500 text-indigo-500" 
        />
        <StatCard 
          icon={MessageSquare} 
          title="Total Messages" 
          value={rooms.reduce((acc, room) => acc + room.messageCount, 0)} 
          colorClass="bg-purple-500 text-purple-500" 
        />
        <StatCard 
          icon={Palette} 
          title="Most Used Theme" 
          value={Object.keys(analytics.activeThemes).length > 0 
            ? Object.entries(analytics.activeThemes).sort((a,b)=>b[1]-a[1])[0][0] 
            : 'N/A'
          } 
          colorClass="bg-pink-500 text-pink-500" 
        />
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Rooms</h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Team Code or Theme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Theme</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Users</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Messages</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uptime</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
                    Loading rooms...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No active Secret Lounge rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.teamCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{room.teamCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md capitalize">
                        {room.theme}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {room.participants.slice(0, 3).map((p, i) => (
                          <img 
                            key={i} 
                            src={p.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                            title={p.name}
                          />
                        ))}
                        {room.participants.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            +{room.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {room.messageCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(room.createdAt))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(room.teamCode)}
                        disabled={isDeleting}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Terminate Room"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecretLoungeManagement;
