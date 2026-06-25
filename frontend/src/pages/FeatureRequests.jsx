import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetRequestsQuery, useCreateRequestMutation, useToggleUpvoteMutation } from '../features/api/requestApiSlice';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Heart, Plus, X, Loader2, Film, Gamepad2, Smartphone, Wrench, CheckCircle, AlertCircle, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500"
            >
              <span className="text-5xl drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500">💡</span>
              <span>Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 drop-shadow-lg">Anything.</span></span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl transform group-hover:translate-x-2 transition-transform duration-500 delay-75"
            >
              Can't find a specific movie, series, game, or app? Request it here! Upvote others' requests to help us prioritize what to add next. ✨🚀
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => user ? setIsModalOpen(true) : toast.info('Please log in to submit a request')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Request
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Sort:</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-2 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="popular">Most Upvoted</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Type:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-2 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Movie">Movies</option>
              <option value="Web Series">Web Series</option>
              <option value="Game">Games</option>
              <option value="App">Apps</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
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
            <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Film className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Requests Found</h3>
            <p className="text-slate-500 dark:text-slate-400">Be the first to request something in this category!</p>
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
                    className="relative group bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl">
                          {getTypeIcon(req.type)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{req.type}</span>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUpvote(req._id)}
                        disabled={isUpvoting}
                        className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl transition-colors ${
                          isUpvoted 
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20' 
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isUpvoted ? <Heart className="w-5 h-5 mb-1 fill-current" /> : <Heart className="w-5 h-5 mb-1" />}
                        <span className="text-xs font-bold">{req.upvotes}</span>
                      </button>
                    </div>

                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{req.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 min-h-[60px]">
                      {req.description}
                    </p>

                    {req.adminResponse && (
                      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Admin Response:</span>
                        <p className="text-sm text-indigo-900 dark:text-indigo-200">{req.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <img 
                        src={req.user?.profileImage || '/default-avatar.png'} 
                        alt={req.user?.name} 
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
          <div className="flex justify-center mt-12 gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-medium text-slate-500">Page {page} of {data.totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 font-medium"
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">New Request</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="Movie">Movie</option>
                      <option value="Web Series">Web Series</option>
                      <option value="Game">Game</option>
                      <option value="App">App</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name / Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Inception (2010)"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Details (Optional context)</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Any specific version, quality, or mod you are looking for?"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none h-32"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isCreating || !title || !description}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2"
                  >
                    {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Request'}
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
