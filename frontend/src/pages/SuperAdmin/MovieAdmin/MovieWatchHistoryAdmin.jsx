import React from 'react';
import { History, Loader2, Clock , LayoutTemplate } from 'lucide-react';
import { useGetMovieWatchHistoryQuery } from '../../../features/movie/movieApiSlice';
import BackButton from '../../../components/BackButton';

export default function MovieWatchHistoryAdmin() {
  const { data: res, isLoading } = useGetMovieWatchHistoryQuery();
  const history = res?.data || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-500" /> Watch History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Monitor recently watched content across the platform.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium w-1/3">User</th>
                  <th className="p-4 font-medium w-1/3">Content Watched</th>
                  <th className="p-4 font-medium">Watch Time</th>
                  <th className="p-4 font-medium text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No watch history recorded yet.
                    </td>
                  </tr>
                ) : history.map(record => (
                  <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden">
                          {record.user?.profileImage ? (
                            <img src={record.user.profileImage} alt={record.user.name} className="w-full h-full object-cover" />
                          ) : (
                            record.user?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{record.user?.name || 'Unknown User'}</div>
                          <div className="text-xs text-slate-500">{record.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {record.movie?.posterImage && (
                          <img src={record.movie.posterImage} alt={record.movie.title} className="w-8 h-12 object-cover rounded bg-slate-200 dark:bg-slate-800" />
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">{record.movie?.title || 'Deleted Content'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatDate(record.lastViewed || record.createdAt)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {record.progress ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{ width: `${Math.min(100, record.progress)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500">{Math.round(record.progress)}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Viewed</span>
                      )}
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