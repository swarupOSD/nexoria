import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink , LayoutTemplate } from 'lucide-react';
import { useGetGamesQuery, useDeleteGameMutation } from '../../../features/games/gameApiSlice';
import toast from 'react-hot-toast';
import BackButton from '../../../components/BackButton';

const GamesList = () => {
  const { data: res, isLoading } = useGetGamesQuery();
  const [deleteGame] = useDeleteGameMutation();

  const games = res?.data || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(id).unwrap();
        toast.success('Game deleted successfully');
      } catch (err) {
        toast.error('Failed to delete game');
      }
    }
  };

  if (isLoading) return <div className="text-white p-6">Loading games...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Games Manager</h1>
        <Link
          to="/superadmin/games/add"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Game
        </Link>
      </div>

      <div className="bg-[#1a1a1f] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/20 text-slate-400">
              <tr>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Link</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {games.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No games found. Add your first game!
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {game.logo ? (
                        <img src={game.logo} alt={game.title} className="w-10 h-10 rounded-lg object-cover bg-black/50" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 font-bold">{game.title?.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{game.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{game.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">v{game.version}</td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-medium">
                        ★ {game.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={game.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/superadmin/games/edit/${game._id}`}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(game._id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GamesList;
