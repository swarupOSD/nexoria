import React from 'react';
import { Star, Loader2, TrendingUp } from 'lucide-react';
import { useGetAdminMovieRatingsQuery } from '../../../features/movie/movieApiSlice';

export default function MovieRatingsAdmin({ type = 'Movie' }) {
  const { data: res, isLoading } = useGetAdminMovieRatingsQuery();
  const movies = res?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" /> 
            {type === 'Web Series' ? 'TV Show' : type} Ratings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Overview of highest rated content across the platform.
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
                  <th className="p-4 font-medium w-1/2">Content Title</th>
                  <th className="p-4 font-medium">Average Rating</th>
                  <th className="p-4 font-medium">Total Votes</th>
                  <th className="p-4 font-medium text-right">IMDb / TMDb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {movies.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No ratings data found.
                    </td>
                  </tr>
                ) : movies.map(movie => (
                  <tr key={movie._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {movie.posterImage && (
                          <img src={movie.posterImage} alt={movie.title} className="w-10 h-14 object-cover rounded-md bg-slate-200 dark:bg-slate-800" />
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white">{movie.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {movie.averageRating?.toFixed(1) || '0.0'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {movie.totalVotes || 0} votes
                    </td>
                    <td className="p-4 text-right text-slate-500 dark:text-slate-400">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">IMDb: {movie.imdbRating || 'N/A'}</span>
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