import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetRequestsQuery, useCreateRequestMutation, useToggleUpvoteMutation } from '../features/api/requestApiSlice';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Heart, Plus, X, Loader2, Film, Gamepad2, Smartphone, Wrench, CheckCircle, AlertCircle, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

const FeatureRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Movie');
  const [description, setDescription] = useState('');

  const { data, isLoading, isFetching } = useGetRequestsQuery({
    page,
    limit: 12,
    sort,
    type: filterType !== 'All' ? filterType : undefined,
    status: filterStatus !== 'All' ? filterStatus : undefined,
  });

  const [createRequest, { isLoading: isCreating }] = useCreateRequestMutation();
  const [toggleUpvote, { isLoading: isUpvoting }] = useToggleUpvoteMutation();

  const handleUpvote = async (id) => {
    if (!user) {
      toast.info('Please log in to upvote requests');
      return;
    }
    try {
      await toggleUpvote(id).unwrap();
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a request');
      return;
    }
    try {
      await createRequest({ title, type, description }).unwrap();
      toast.success('Request submitted successfully!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit request');
    }
  };

  const getTypeIcon = (reqType) => {
    switch (reqType) {
      case 'Movie': return <Film className="w-5 h-5 text-blue-500" />;
      case 'Web Series': return <Tv className="w-5 h-5 text-purple-500" />;
      case 'Game': return <Gamepad2 className="w-5 h-5 text-green-500" />;
      case 'App': return <Smartphone className="w-5 h-5 text-amber-500" />;
      default: return <Wrench className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 'In Progress': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Working</span>;
      case 'Rejected': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1"><X className="w-3 h-3"/> Rejected</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Pending</span>;
    }
  };

  return (
    <div className="font-jakarta min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="mb-6">
          <BackButton fallbackRoute="/" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative group bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500 text-white"
            >
              <span className="text-5xl drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500">💡</span>
              <span>Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">Anything.</span></span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/60 font-medium max-w-2xl transform group-hover:translate-x-2 transition-transform duration-500 delay-75 leading-relaxed"
            >
              Can't find a specific movie, series, game, or app? Request it here! Upvote others' requests to help us prioritize what to add next. ✨🚀
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => user ? setIsModalOpen(true) : toast.info('Please log in to submit a request')}
            className="relative z-10 flex items-center gap-2 px-6 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] transition-all transform active:scale-95 group overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> <span className="relative z-10">New Request</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/5 rounded-[2rem] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/50 tracking-wide uppercase">Sort:</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-white appearance-none"
            >
              <option className="bg-[#111]" value="popular">Most Upvoted</option>
              <option className="bg-[#111]" value="newest">Newest First</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/50 tracking-wide uppercase">Type:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-white appearance-none"
            >
              <option className="bg-[#111]" value="All">All Types</option>
              <option className="bg-[#111]" value="Movie">Movies</option>
              <option className="bg-[#111]" value="Web Series">Web Series</option>
              <option className="bg-[#111]" value="Game">Games</option>
              <option className="bg-[#111]" value="App">Apps</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/50 tracking-wide uppercase">Status:</span>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-2 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-4 shadow-inner">
              <Film className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight text-white">No Requests Found</h3>
            <p className="text-white/50 font-medium">Be the first to request something in this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {data?.data?.map((req, index) => {
                const isUpvoted = user && req.upvotedBy.includes(user._id);
                return (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group bg-white/5 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                          {getTypeIcon(req.type)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1">{req.type}</span>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUpvote(req._id)}
                        disabled={isUpvoting}
                        className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-all shadow-inner ${
                          isUpvoted 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {isUpvoted ? <Heart className="w-5 h-5 mb-1 fill-current" /> : <Heart className="w-5 h-5 mb-1" />}
                        <span className="text-xs font-black">{req.upvotes}</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-black mb-2 line-clamp-1 tracking-tight text-white group-hover:text-blue-400 transition-colors">{req.title}</h3>
                    <p className="text-[15px] text-white/60 font-medium mb-4 line-clamp-3 min-h-[60px] leading-relaxed">
                      {req.description}
                    </p>

                    {req.adminResponse && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl backdrop-blur-md">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block mb-1">Admin Response:</span>
                        <p className="text-sm font-medium text-white/90">{req.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10">
                      <img 
                        src={req.user?.profileImage || '/default-avatar.png'} 
                        alt={req.user?.name} 
                        className="w-7 h-7 rounded-full border border-white/20"
                      />
                      <span className="text-xs font-bold text-white/50">
                        Requested by {req.user?.name}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination (Simple) */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-3 items-center">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 disabled:opacity-50 font-bold text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-inner"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-black text-white/50 tracking-wide">Page {page} of {data.totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 disabled:opacity-50 font-bold text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-inner"
            >
              Next
            </button>
          </div>
        )}

      </div>

      {/* Create Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-black/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tight">New Request</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner appearance-none"
                    >
                      <option className="bg-[#111]" value="Movie">Movie</option>
                      <option className="bg-[#111]" value="Web Series">Web Series</option>
                      <option className="bg-[#111]" value="Game">Game</option>
                      <option className="bg-[#111]" value="App">App</option>
                      <option className="bg-[#111]" value="Other">Other</option>
                    </select>
                    <label className="absolute left-4 top-[6px] text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                      Category
                    </label>
                  </div>

                  <div className="relative group">
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Name / Title"
                      className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner"
                      required
                    />
                    <label className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider">
                      Name / Title
                    </label>
                  </div>

                  <div className="relative group">
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Details (Optional context)"
                      className="peer w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-6 pb-4 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner resize-none h-32"
                      required
                    ></textarea>
                    <label className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[20px] peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[8px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider">
                      Details (Optional context)
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isCreating || !title || !description}
                    className="group relative w-full h-14 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    <div className="relative z-10 flex items-center justify-center gap-2 text-lg">
                      {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Request'}
                    </div>
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FeatureRequests;
