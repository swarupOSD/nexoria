import CustomSearchBar from '../../components/CustomSearchBar';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGetAdminPostsQuery, useDeletePostMutation, useModeratePostMutation } from "../../features/post/postApiSlice";
import BackButton from '../../components/BackButton';

const AdminPosts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/superadmin') ? '/superadmin/apps' : '/admin/posts';

  const [statusFilter, setStatusFilter] = useState('');
  const { data: postsData, isLoading, refetch } = useGetAdminPostsQuery({ page, limit: 10, status: statusFilter, search: debouncedSearchQuery });
  const [deletePost] = useDeletePostMutation();
  const [moderatePost] = useModeratePostMutation();

  const posts = postsData?.data || [];
  const pagination = postsData?.pagination || {};

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Under Development': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Posts Management - Admin Panel</title>
      </Helmet>

      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/admin" showText={false} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-white flex items-center gap-2 tracking-tight">
              App Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and moderate all applications and posts.</p>
          </div>
        </div>
        <Link 
          to={`${basePath}/create`} 
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all w-max border border-blue-500/50"
        >
          <Plus className="w-5 h-5" /> Add New App
        </Link>
      </div>

      {/* Table Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0B0F19]/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <CustomSearchBar value={searchQuery} placeholder="Search apps by title..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0B0F19] border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm w-full sm:w-auto text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Active">Active</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Draft">Draft</option>
              <option value="Under Development">Under Development</option>
              <option value="Maintenance Mode">Maintenance Mode</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Hidden">Hidden</option>
              <option value="Rejected">Rejected</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 pl-6">App Details</th>
                <th className="p-5">Category</th>
                <th className="p-5">Visibility</th>
                <th className="p-5">Downloads</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
                <th className="p-5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="7" className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-medium">No apps found.</td></tr>
              ) : posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6">
                    <div className="flex items-center gap-4">
                      {post.appLogo ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0F19] border border-slate-700/50 p-1 flex-shrink-0">
                          <img src={post.appLogo} alt={post.title} className="w-full h-full rounded-lg object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#0B0F19] border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white mb-0.5 truncate max-w-[200px] text-sm">{post.title}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">v{post.version || '1.0'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-300 font-medium">{post.category?.name || post.categoryObj?.name || 'Uncategorized'}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      post.visibilityStatus === 'Public' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      post.visibilityStatus === 'Premium Only' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-800/50 text-slate-400 border-slate-700'
                    }`}>
                      {post.visibilityStatus || 'Public'}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-max">
                      <Download className="w-3.5 h-3.5" />
                      {post.downloads}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      ['Published', 'Active'].includes(post.status) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      post.status === 'Under Development' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-slate-800/50 text-slate-400 border-slate-700'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link to={`${basePath}/edit/${post._id}`} title="Edit App" className="p-2.5 bg-[#0B0F19] hover:bg-blue-500/20 text-blue-400 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all shadow-lg">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        title="Delete App"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this app?')) {
                            try {
                              await deletePost(post._id).unwrap();
                              refetch();
                            } catch (err) {
                              toast.error(err?.data?.message || 'Delete failed');
                            }
                          }
                        }}
                        className="p-2.5 bg-[#0B0F19] hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-all shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400 bg-[#0B0F19]/30">
          <span className="font-medium">Showing Page {pagination.page || 1} of {pagination.totalPages || 1} ({pagination.totalItems || 0} total apps)</span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-[#111827] border border-slate-700 hover:border-slate-500 hover:text-white disabled:opacity-50 transition-all shadow-sm shadow-black/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-[#111827] border border-slate-700 hover:border-slate-500 hover:text-white disabled:opacity-50 transition-all shadow-sm shadow-black/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPosts;
