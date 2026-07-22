import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Trash2, Calendar, Settings , LayoutTemplate } from 'lucide-react';
import { useGetAdminPostsQuery, useDeletePostMutation } from '../../features/post/postApiSlice';
import BackButton from '../../components/BackButton';
import { 
  useGetReportsQuery, 
  useResolveReportMutation, 
  useRejectReportMutation, 
  useDeleteReportMutation 
} from '../../features/report/reportApiSlice';
import { 
  useApprovePostMutation, 
  useRejectPostMutation, 
  useMarkUnderDevelopmentMutation, 
  useSchedulePostMutation 
} from '../../features/moderation/moderationApiSlice';

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Queries
  const { data: postsData, isLoading: loadingPosts, refetch: refetchPosts } = useGetAdminPostsQuery({ limit: 100 });
  const { data: reportsData, isLoading: loadingReports, refetch: refetchReports } = useGetReportsQuery();
  
  const posts = postsData?.data || [];
  const reports = reportsData?.data || [];

  // Mutations
  const [approvePost] = useApprovePostMutation();
  const [rejectPost] = useRejectPostMutation();
  const [markUnderDevelopment] = useMarkUnderDevelopmentMutation();
  const [schedulePost] = useSchedulePostMutation();
  const [deletePost] = useDeletePostMutation();

  const [resolveReport] = useResolveReportMutation();
  const [rejectReport] = useRejectReportMutation();
  const [deleteReport] = useDeleteReportMutation();

  // Handlers for Posts
  const handleApprovePost = async (id) => {
    if (window.confirm('Approve and publish this post?')) {
      await approvePost(id);
      refetchPosts();
    }
  };

  const handleRejectPost = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason) {
      await rejectPost({ id, reason });
      refetchPosts();
    }
  };

  const handleUnderDevelopment = async (id) => {
    if (window.confirm('Mark this post as Under Development?')) {
      await markUnderDevelopment(id);
      refetchPosts();
    }
  };

  const handleSchedulePost = async (id) => {
    const dateStr = window.prompt('Enter schedule date (YYYY-MM-DD):');
    if (dateStr) {
      await schedulePost({ id, scheduledPublishDate: new Date(dateStr) });
      refetchPosts();
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Delete this post permanently?')) {
      await deletePost(id).unwrap();
      refetchPosts();
    }
  };

  // Handlers for Reports
  const handleResolveReport = async (id) => {
    await resolveReport(id);
    refetchReports();
  };

  const handleRejectReportItem = async (id) => {
    await rejectReport(id);
    refetchReports();
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Delete this report?')) {
      await deleteReport(id).unwrap();
      refetchReports();
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Content Moderation - Admin</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" /> Content Moderation
          </h1>
          <p className="text-slate-400 mt-1">Review posts and handle user reports.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'posts' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <FileText className="w-4 h-4" /> Post Moderation
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'reports' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
        >
          <AlertTriangle className="w-4 h-4" /> User Reports
        </button>
      </div>

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-5">App Title</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Created At</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loadingPosts ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading posts...</td></tr>
                ) : posts.map(post => (
                  <tr key={post._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <img src={post.appLogo || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded bg-white object-cover" alt="logo" />
                        {post.title}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-400">{post.category?.name || 'Uncategorized'}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        post.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' :
                        post.status === 'Draft' ? 'bg-slate-500/20 text-slate-400' :
                        post.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                        post.status === 'Under Development' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {post.status !== 'Published' && (
                          <button onClick={() => handleApprovePost(post._id)} title="Approve" className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {post.status !== 'Rejected' && (
                          <button onClick={() => handleRejectPost(post._id)} title="Reject" className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {post.status !== 'Under Development' && (
                          <button onClick={() => handleUnderDevelopment(post._id)} title="Under Development" className="p-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded">
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleSchedulePost(post._id)} title="Schedule" className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded">
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePost(post._id)} title="Delete" className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-5">Reporter</th>
                  <th className="p-5">App Name</th>
                  <th className="p-5">Reason</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loadingReports ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">Loading reports...</td></tr>
                ) : reports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-5">
                      <div className="text-sm font-bold text-white">{report.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{report.user?.email || 'N/A'}</div>
                    </td>
                    <td className="p-5 text-sm font-medium text-blue-400">{report.post?.title || 'Deleted App'}</td>
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-300">{report.reason}</div>
                      <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={report.description}>{report.description}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        report.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                        report.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {report.status === 'Pending' && (
                          <>
                            <button onClick={() => handleResolveReport(report._id)} title="Resolve" className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectReportItem(report._id)} title="Reject" className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDeleteReport(report._id)} title="Delete" className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && !loadingReports && (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">No reports found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default AdminModeration;
