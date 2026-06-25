import React from 'react';
import { useGetMovieApprovalQueueQuery, useModerateMovieApprovalMutation } from '../../../features/movie/movieApiSlice';
import { toast } from 'react-hot-toast';

export default function MovieApprovalQueue({ type = 'Movie' }) {
  const { data: moviesRes, isLoading } = useGetMovieApprovalQueueQuery();
  const [moderateMovie] = useModerateMovieApprovalMutation();
  const movies = moviesRes?.data || [];

  const handleModerate = async (id, status) => {
    try {
      await moderateMovie({ id, status }).unwrap();
      toast.success(`Movie marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">{type === 'Web Series' ? 'TV Show' : type === 'Animation' ? 'Animation' : 'Movie'} Approval Queue</h1>
      {isLoading ? <p className="text-white">Loading...</p> : (
        <div className="space-y-4">
          {movies.length === 0 && <p className="text-slate-400">No movies pending approval.</p>}
          {movies.map(movie => (
            <div key={movie._id} className="bg-[#111] p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={movie.posterImage} alt="" className="w-12 h-16 rounded object-cover" />
                <div>
                  <h3 className="text-white font-bold">{movie.title}</h3>
                  <p className="text-slate-400 text-sm">Author: {movie.author?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleModerate(movie._id, 'Active')} className="px-4 py-2 bg-emerald-600 text-white rounded">Approve</button>
                <button onClick={() => handleModerate(movie._id, 'Rejected')} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
                <button onClick={() => handleModerate(movie._id, 'Hidden')} className="px-4 py-2 bg-amber-600 text-white rounded">Suspend</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}