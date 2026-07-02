import CustomSearchBar from '../../components/CustomSearchBar';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  AlertOctagon, CheckCircle, XCircle, Trash2, 
  Search, Link as LinkIcon, Loader2 
, LayoutTemplate } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { 
  useGetReportsQuery, 
  useResolveReportMutation, 
  useRejectReportMutation, 
  useDeleteReportMutation 
} from '../../features/report/reportApiSlice';

const AdminReports = () => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: reportsRes, isLoading, refetch } = useGetReportsQuery();
  const [resolveReport] = useResolveReportMutation();
  const [rejectReport] = useRejectReportMutation();
  const [deleteReport] = useDeleteReportMutation();

  const allReports = reportsRes?.data || [];

  const filteredReports = allReports.filter(report => {
    const matchesFilter = filter === 'All' ? true : report.status === filter;
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      report.post?.title?.toLowerCase().includes(searchString) || 
      report.user?.name?.toLowerCase().includes(searchString) || 
      report.reason?.toLowerCase().includes(searchString);
    return matchesFilter && matchesSearch;
  });

  const handleResolve = async (id) => {
    if (window.confirm('Mark this report as resolved?')) {
      try {
        await resolveReport(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to resolve report');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this report?')) {
      try {
        await rejectReport(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to reject report');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report record?')) {
      try {
        await deleteReport(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete report');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>App & Link Reports - Admin Panel</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              User Reports
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage app and broken link reports submitted by users.</p>
          </div>
        </div>
      </div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0B0F19]/30">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <CustomSearchBar value={searchQuery} placeholder="Search by app, user, or reason..." name="text"  onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Resolved', 'Rejected'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-[#0B0F19] text-slate-400 border border-slate-700/50 hover:bg-slate-800/80 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B0F19]/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 pl-6">Report Details</th>
                <th className="p-5">Target App</th>
                <th className="p-5">Reporter</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" /></td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-500 font-medium">No reports found matching your criteria.</td></tr>
              ) : filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5 pl-6 min-w-[250px]">
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-red-500" />
                        {report.reason}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 mt-1 bg-[#0B0F19] p-2 rounded-lg border border-slate-700/50 italic">
                        "{report.description}"
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wide">
                        Reported on: {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    {report.post ? (
                      <Link to={`/post/${report.post.slug}`} className="flex items-center gap-3 group/link hover:bg-slate-800/50 p-2 rounded-xl transition-all border border-transparent hover:border-slate-700/50 w-max">
                        {report.post.appLogo ? (
                          <img src={report.post.appLogo} alt="App" className="w-10 h-10 rounded-lg object-cover bg-white" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#0B0F19] border border-slate-700 flex items-center justify-center">
                            <AlertOctagon className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-sm text-blue-400 group-hover/link:underline truncate max-w-[150px]">{report.post.title}</div>
                          {report.downloadLink && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <LinkIcon className="w-3 h-3" /> Specific Link
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <span className="text-slate-500 text-sm italic">App Deleted</span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-medium text-slate-300">{report.user?.name || 'Unknown User'}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[150px]">{report.user?.email}</div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      report.status === 'Rejected' ? 'bg-slate-800/50 text-slate-400 border-slate-700' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {report.status === 'Pending' && (
                        <>
                          <button onClick={() => handleResolve(report._id)} title="Resolve Report" className="p-2 bg-[#0B0F19] hover:bg-emerald-500/20 text-emerald-500 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all shadow-lg">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(report._id)} title="Reject Report" className="p-2 bg-[#0B0F19] hover:bg-slate-700/50 text-slate-400 border border-slate-700 rounded-lg transition-all shadow-lg">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(report._id)} title="Delete Record" className="p-2 bg-[#0B0F19] hover:bg-rose-500/20 text-rose-500 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-all shadow-lg">
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
    </div>
  );
};

export default AdminReports;
