import React from 'react';
import { AlertTriangle, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetAdminMovieReportsQuery, 
  useModerateMovieReportMutation, 
  useDeleteMovieReportMutation 
} from '../../../features/movie/movieApiSlice';

export default function MovieReportsAdmin({ type = 'Movie' }) {
  const { data: res, isLoading } = useGetAdminMovieReportsQuery();
  const [moderateReport] = useModerateMovieReportMutation();
  const [deleteReport] = useDeleteMovieReportMutation();

  const reports = res?.data || [];

  const handleResolve = async (id) => {
    try {
      await moderateReport({ id, status: 'Resolved' }).unwrap();
      toast.success('Report marked as resolved');
    } catch (err) {
      toast.error('Error updating report');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this report?')) return;
    try {
      await deleteReport(id).unwrap();
      toast.success('Report deleted');
    } catch (err) {
      toast.error('Error deleting report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" /> 
            {type === 'Web Series' ? 'TV Show' : type} Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage user reports for broken links or bad content.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Reported By</th>
                  <th className="p-4 font-medium">Content</th>
                  <th className="p-4 font-medium w-1/3">Issue / Reason</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No reports found.
                    </td>
                  </tr>
                ) : reports.map(report => (
                  <tr key={report._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{report.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{report.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {report.movie?.title || 'Deleted Content'}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded text-xs font-semibold mb-1">
                        {report.reason || 'Other'}
                      </span>
                      <p className="line-clamp-2 text-xs">{report.message || 'No additional details provided.'}</p>
                    </td>
                    <td className="p-4">
                      {report.status === 'Resolved' ? (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {report.status !== 'Resolved' && (
                          <button onClick={() => handleResolve(report._id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-md" title="Mark as Resolved">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(report._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}