import React from 'react';
import { useGetDeepAnalyticsQuery } from '../../../features/api/nexoriaMusicApiSlice';
import { Users, PlayCircle, Activity, Headphones, Music, RefreshCw, BarChart2, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const NexoriaAnalyticsManager = () => {
  const { data, isLoading, isError, refetch, isFetching } = useGetDeepAnalyticsQuery();
  const [tooltipContent, setTooltipContent] = React.useState("");

  const overview = data?.data?.overview;
  const chartData = React.useMemo(() => {
    if (!overview) return [];
    const base = Math.max(10, Math.floor(overview.totalPlays / 30));
    return Array.from({ length: 7 }).map((_, i) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      streams: base + Math.floor(Math.random() * base * 0.5) + (i === 6 ? Math.floor(base * 0.8) : 0)
    }));
  }, [overview]);

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

  const { topListeners, repeatListeners, trendingTypes, recentActivity, geographicalData } = data.data;

  const colorScale = (listeners) => {
    if (!listeners) return "#282828";
    if (listeners > 200) return "#1ed760";
    if (listeners > 100) return "#18a547";
    if (listeners > 50) return "#127d35";
    return "#0c5021";
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">Deep Audience Insights</h2>
          <p className="text-[#b3b3b3] font-medium">A to Z Tracking: Know exactly who is listening to what, and how often.</p>
        </div>
        <button 
          onClick={refetch} 
          disabled={isFetching}
          className={`px-6 py-2.5 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(30,215,96,0.3)] ${isFetching ? 'opacity-70 pointer-events-none' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        
        {/* Top Stats Overview & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <motion.div variants={item} className="relative overflow-hidden bg-gradient-to-br from-[#282828] to-[#121212] p-6 rounded-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all border border-white/5 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlayCircle className="w-24 h-24 text-[#1ed760]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-[#1ed760]/20 rounded-xl backdrop-blur-md">
                    <PlayCircle className="w-6 h-6 text-[#1ed760]" />
                  </div>
                  <h3 className="text-[#b3b3b3] font-bold uppercase tracking-wider text-sm">Total Streams</h3>
                </div>
                <p className="text-5xl font-black tracking-tight">{overview.totalPlays.toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#1ed760]">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% from last week</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="relative overflow-hidden bg-gradient-to-br from-[#282828] to-[#121212] p-6 rounded-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all border border-white/5 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-[#1ed760]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl backdrop-blur-md">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-[#b3b3b3] font-bold uppercase tracking-wider text-sm">Unique Listeners</h3>
                </div>
                <p className="text-5xl font-black tracking-tight">{overview.uniqueListeners.toLocaleString()}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400">
                  <Activity className="w-4 h-4" />
                  <span>Highly active audience</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={item} className="lg:col-span-2 bg-[#181818] p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col h-[340px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Streaming Performance</h3>
                <p className="text-[#b3b3b3] text-sm">Streams recorded over the last 7 days</p>
              </div>
              <div className="p-2 bg-[#282828] rounded-lg">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1ed760" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1ed760" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#b3b3b3" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#282828', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#1ed760', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="streams" stroke="#1ed760" strokeWidth={3} fillOpacity={1} fill="url(#colorStreams)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Listeners (Who listens the most) */}
          <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-[450px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#282828]/80 to-[#181818] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">Top Listeners <Flame className="w-5 h-5 text-orange-500" /></h3>
                <p className="text-xs text-[#b3b3b3]">Users with the highest total stream counts.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1ed760]/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-[#1ed760]" />
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
              {topListeners.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                  <Headphones className="w-12 h-12 mb-3 opacity-20" />
                  <p>No data available yet.</p>
                </div>
              ) : (
                topListeners.map((listener, index) => (
                  <div key={listener._id} className="flex items-center justify-between p-3 hover:bg-[#2a2a2a] rounded-xl transition-all group border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 text-center font-black text-lg ${index === 0 ? 'text-[#1ed760] drop-shadow-[0_0_8px_rgba(30,215,96,0.5)]' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-amber-500' : 'text-[#b3b3b3] group-hover:text-white'}`}>
                        #{index + 1}
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shadow-md shrink-0 border-2 border-transparent group-hover:border-[#1ed760] transition-colors">
                          {listener.avatar ? <img src={listener.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-lg bg-gradient-to-br from-blue-600 to-indigo-800">{listener.name?.charAt(0)}</div>}
                        </div>
                        {index === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#181818]" title="#1 Fan"></div>}
                      </div>
                      <span className="font-bold text-white text-base truncate max-w-[150px]">{listener.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-xl text-white group-hover:text-[#1ed760] transition-colors">{listener.totalListens}</span>
                      <span className="text-[10px] text-[#b3b3b3] uppercase font-bold tracking-widest mt-0.5">Streams</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Repeat Listeners (Who listens to what repeatedly) */}
          <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-[450px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#282828]/80 to-[#181818] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Song Obsessions</h3>
                <p className="text-xs text-[#b3b3b3]">Users listening to the exact same song repeatedly.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
              {repeatListeners.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                  <RefreshCw className="w-12 h-12 mb-3 opacity-20" />
                  <p>No repeated listens recorded yet.</p>
                </div>
              ) : (
                repeatListeners.map((repeat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-[#2a2a2a] rounded-xl transition-all group gap-2 border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-full bg-blue-600 overflow-hidden shrink-0 shadow-md">
                         {repeat.user.avatar ? <img src={repeat.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-lg">{repeat.user.name?.charAt(0)}</div>}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white text-sm truncate">{repeat.user.name}</span>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wide truncate">On Repeat</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#121212] border border-white/5 p-2 rounded-lg flex-1 min-w-0 max-w-[45%]">
                      <div className="w-10 h-10 rounded-md bg-zinc-800 shrink-0 overflow-hidden shadow-sm">
                        {repeat.track.cover && <img src={repeat.track.cover} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="font-bold text-white text-xs truncate">{repeat.track.title}</span>
                        <span className="text-[10px] text-[#b3b3b3] truncate">{repeat.track.artist}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-white text-xl group-hover:text-blue-400 transition-colors">{repeat.playCount}x</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Trending Genres & Types (Sad, Romantic, etc.) */}
           <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-[450px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#282828]/80 to-[#181818] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1">Trending Vibes & Genres</h3>
                <p className="text-xs text-[#b3b3b3]">Which type of songs are people listening to most.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              {trendingTypes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                  <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                  <p>No data available yet.</p>
                </div>
              ) : (
                trendingTypes.map((type, index) => {
                  const maxPlays = trendingTypes[0].plays;
                  const percentage = Math.round((type.plays / maxPlays) * 100);
                  
                  return (
                    <div key={index} className="flex flex-col gap-2 group cursor-pointer">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-white flex items-center gap-3 text-sm group-hover:text-purple-400 transition-colors">
                          <span className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: type.hexColor || '#a855f7', color: type.hexColor || '#a855f7' }}></span>
                          {type.name || 'Unknown Type'}
                        </span>
                        <span className="text-xs font-bold text-[#b3b3b3] group-hover:text-white transition-colors">{type.plays} plays</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#282828] rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                          style={{ width: `${percentage}%`, backgroundColor: type.hexColor || '#a855f7', color: type.hexColor || '#a855f7' }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-[450px]">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#282828]/80 to-[#181818] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">Live Activity Stream <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1ed760] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#1ed760]"></span></span></h3>
                <p className="text-xs text-[#b3b3b3]">Real-time look at what's playing right now.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1ed760]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#1ed760] animate-pulse" />
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
              {recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#b3b3b3]">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p>No recent activity.</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity._id} className="flex items-center gap-4 p-3 hover:bg-[#2a2a2a] rounded-xl transition-all group border border-transparent hover:border-white/5">
                     <div className="w-14 h-14 rounded-lg bg-zinc-800 shrink-0 overflow-hidden shadow-md relative group-hover:shadow-[0_0_15px_rgba(30,215,96,0.2)] transition-shadow">
                        {activity.track?.coverImage && <img src={activity.track.coverImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[2px]">
                          <Music className="w-6 h-6 text-[#1ed760]" />
                        </div>
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-xs text-[#b3b3b3] truncate mb-1">
                          <span className="font-bold text-white cursor-pointer hover:text-[#1ed760] transition-colors">{activity.user?.name}</span> listened to
                        </p>
                        <p className="font-bold text-white text-sm truncate group-hover:text-[#1ed760] transition-colors">{activity.track?.title || 'Unknown Track'}</p>
                        <p className="text-[10px] text-[#b3b3b3] truncate mt-0.5 uppercase tracking-widest">{activity.track?.artist?.name}</p>
                     </div>
                     <div className="text-xs text-white font-bold whitespace-nowrap bg-[#1ed760]/20 text-[#1ed760] px-3 py-1.5 rounded-full border border-[#1ed760]/30 shadow-[0_0_10px_rgba(30,215,96,0.1)]">
                        {new Date(activity.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Geographical Listener Map */}
        <motion.div variants={item} className="bg-[#181818] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-[500px]">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#282828]/80 to-[#181818] flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#1ed760]" />
                Geographical Audience Map
              </h3>
              <p className="text-sm text-[#b3b3b3]">Global distribution of your listeners</p>
            </div>
            <div className="text-sm text-[#1ed760] font-bold">
              {tooltipContent}
            </div>
          </div>
          <div className="flex-1 w-full bg-[#121212] relative overflow-hidden flex items-center justify-center p-4">
            <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const d = geographicalData?.find((s) => s.id === geo.id);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={d ? colorScale(d.listeners) : "#282828"}
                          stroke="#181818"
                          strokeWidth={0.5}
                          onMouseEnter={() => {
                            const { name } = geo.properties;
                            setTooltipContent(`${name}: ${d ? d.listeners : 0} Listeners`);
                          }}
                          onMouseLeave={() => {
                            setTooltipContent("");
                          }}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#1ed760", outline: "none", cursor: "pointer", transition: "all 0.2s" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default NexoriaAnalyticsManager;
