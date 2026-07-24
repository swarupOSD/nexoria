import React from 'react';
import { useGetDeepAnalyticsQuery } from '../../../features/api/nexoriaMusicApiSlice';
import { Users, PlayCircle, Activity, Headphones, Music, RefreshCw, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NexoriaAnalyticsManager = () => {
  const { data, isLoading, isError, refetch, isFetching } = useGetDeepAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#b3b3b3]">
        <div className="w-10 h-10 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold tracking-wide">Analyzing Deep Listener Data...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-lg text-center">
        <h3 className="font-bold text-lg mb-2">Analytics Error</h3>
        <p>Failed to load deep analytics data. Please try again.</p>
        <button onClick={refetch} className="mt-4 px-6 py-2 bg-red-500/20 rounded-full font-bold hover:bg-red-500/30 transition-colors">Retry</button>
      </div>
    );
  }

  const { overview, topListeners, repeatListeners, trendingTypes, recentActivity } = data.data;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Deep Audience Insights</h2>
          <p className="text-[#b3b3b3] font-medium text-sm">A to Z Tracking: Know exactly who is listening to what, and how often.</p>
        </div>
        <button 
          onClick={refetch} 
          disabled={isFetching}
          className={`p-3 bg-[#282828] hover:bg-[#3E3E3E] rounded-full transition-colors ${isFetching ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={item} className="bg-[#181818] p-6 rounded-xl hover:bg-[#282828] transition-colors border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#b3b3b3] font-bold uppercase tracking-wider text-sm">Total Streams</h3>
              <PlayCircle className="w-5 h-5 text-[#1ed760]" />
            </div>
            <p className="text-4xl font-black">{overview.totalPlays.toLocaleString()}</p>
          </motion.div>
          <motion.div variants={item} className="bg-[#181818] p-6 rounded-xl hover:bg-[#282828] transition-colors border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#b3b3b3] font-bold uppercase tracking-wider text-sm">Unique Listeners</h3>
              <Users className="w-5 h-5 text-[#1ed760]" />
            </div>
            <p className="text-4xl font-black">{overview.uniqueListeners.toLocaleString()}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Listeners (Who listens the most) */}
          <motion.div variants={item} className="bg-[#181818] rounded-xl overflow-hidden border border-white/5 flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 bg-[#282828]/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Top Listeners (Superfans)</h3>
                <p className="text-xs text-[#b3b3b3]">Users with the highest total stream counts.</p>
              </div>
              <Headphones className="w-6 h-6 text-[#1ed760]" />
            </div>
            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
              {topListeners.length === 0 ? (
                <p className="text-[#b3b3b3] text-center py-8">No data available yet.</p>
              ) : (
                topListeners.map((listener, index) => (
                  <div key={listener._id} className="flex items-center justify-between p-3 hover:bg-[#282828] rounded-md transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center text-[#b3b3b3] font-bold group-hover:text-white">{index + 1}</div>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shadow-md shrink-0">
                        {listener.avatar ? <img src={listener.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-blue-600">{listener.name?.charAt(0)}</div>}
                      </div>
                      <span className="font-bold text-white truncate max-w-[150px]">{listener.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#1ed760]">{listener.totalListens}</span>
                      <span className="text-[10px] text-[#b3b3b3] block uppercase font-bold tracking-widest mt-0.5">Streams</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Repeat Listeners (Who listens to what repeatedly) */}
          <motion.div variants={item} className="bg-[#181818] rounded-xl overflow-hidden border border-white/5 flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 bg-[#282828]/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Song Obsessions (Repeats)</h3>
                <p className="text-xs text-[#b3b3b3]">Users listening to the exact same song repeatedly.</p>
              </div>
              <RefreshCw className="w-6 h-6 text-[#1ed760]" />
            </div>
            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
              {repeatListeners.length === 0 ? (
                <p className="text-[#b3b3b3] text-center py-8">No repeated listens recorded yet.</p>
              ) : (
                repeatListeners.map((repeat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-[#282828] rounded-md transition-colors group gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-600 overflow-hidden shrink-0 shadow-md">
                         {repeat.user.avatar ? <img src={repeat.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-sm">{repeat.user.name?.charAt(0)}</div>}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white text-sm truncate">{repeat.user.name}</span>
                        <span className="text-[10px] text-[#b3b3b3] truncate">on repeat:</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-md flex-1 min-w-0 max-w-[50%]">
                      <div className="w-8 h-8 rounded-sm bg-zinc-800 shrink-0 overflow-hidden">
                        {repeat.track.cover && <img src={repeat.track.cover} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-white text-xs truncate">{repeat.track.title}</span>
                        <span className="text-[10px] text-[#b3b3b3] truncate">{repeat.track.artist}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-white text-lg">{repeat.playCount}x</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Trending Genres & Types (Sad, Romantic, etc.) */}
           <motion.div variants={item} className="bg-[#181818] rounded-xl overflow-hidden border border-white/5 flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 bg-[#282828]/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Trending Vibes & Genres</h3>
                <p className="text-xs text-[#b3b3b3]">Which type of songs are people listening to most.</p>
              </div>
              <BarChart2 className="w-6 h-6 text-[#1ed760]" />
            </div>
            <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
              {trendingTypes.length === 0 ? (
                <p className="text-[#b3b3b3] text-center py-8">No data available yet.</p>
              ) : (
                trendingTypes.map((type, index) => {
                  const maxPlays = trendingTypes[0].plays;
                  const percentage = Math.round((type.plays / maxPlays) * 100);
                  
                  return (
                    <div key={index} className="flex flex-col gap-1.5 group cursor-pointer">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-white flex items-center gap-2 text-sm group-hover:text-[#1ed760] transition-colors">
                          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: type.hexColor || '#1ed760' }}></span>
                          {type.name || 'Unknown Type'}
                        </span>
                        <span className="text-xs font-bold text-[#b3b3b3] group-hover:text-white transition-colors">{type.plays} plays</span>
                      </div>
                      <div className="h-2 w-full bg-[#282828] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%`, backgroundColor: type.hexColor || '#1ed760' }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div variants={item} className="bg-[#181818] rounded-xl overflow-hidden border border-white/5 flex flex-col h-[400px]">
            <div className="p-6 border-b border-white/5 bg-[#282828]/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Live Activity Stream</h3>
                <p className="text-xs text-[#b3b3b3]">Real-time look at what's playing right now.</p>
              </div>
              <Activity className="w-6 h-6 text-[#1ed760] animate-pulse" />
            </div>
            <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
              {recentActivity.length === 0 ? (
                <p className="text-[#b3b3b3] text-center py-8">No recent activity.</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center gap-4 p-3 hover:bg-[#282828] rounded-md transition-colors group">
                     <div className="w-12 h-12 rounded-sm bg-zinc-800 shrink-0 overflow-hidden shadow-md relative">
                        {activity.track?.coverImage && <img src={activity.track.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-xs text-[#b3b3b3] truncate mb-0.5">
                          <span className="font-bold text-white cursor-pointer hover:underline">{activity.user?.name}</span> listened to
                        </p>
                        <p className="font-bold text-white text-sm truncate">{activity.track?.title || 'Unknown Track'}</p>
                        <p className="text-[10px] text-[#b3b3b3] truncate mt-0.5 uppercase tracking-widest">{activity.track?.artist?.name}</p>
                     </div>
                     <div className="text-xs text-[#b3b3b3] font-medium whitespace-nowrap bg-black/30 px-2 py-1 rounded-md">
                        {new Date(activity.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default NexoriaAnalyticsManager;
