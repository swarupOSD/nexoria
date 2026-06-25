import { useGetPostsQuery } from '../features/post/postApiSlice';
import { Link } from 'react-router-dom';
import { Trophy, Download, Star, Flame } from 'lucide-react';

const Leaderboard = () => {
  // Fetch top 10 downloaded posts
  const { data: postsRes, isLoading } = useGetPostsQuery({ sort: '-downloads', limit: 10 });
  
  if (isLoading) return null;
  const topPosts = postsRes?.data || [];
  
  if (topPosts.length === 0) return null;

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden mb-12">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Trending Now</h2>
            <p className="text-sm text-slate-400">Most downloaded apps this week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {topPosts.slice(0, 5).map((post, idx) => (
            <Link 
              key={post._id} 
              to={`/post/${post.slug}`}
              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all rounded-2xl p-4 group relative overflow-hidden flex flex-col items-center text-center"
            >
              {/* Rank Badge */}
              <div className={`absolute top-0 left-0 w-8 h-8 flex items-center justify-center font-black text-xs rounded-br-xl z-10 ${
                idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50' : 
                idx === 1 ? 'bg-slate-300 text-slate-800' : 
                idx === 2 ? 'bg-amber-600 text-white' : 
                'bg-slate-800 text-slate-400'
              }`}>
                #{idx + 1}
              </div>

              <div className="relative w-20 h-20 mb-3 mt-2">
                <img 
                  src={post.appLogo} 
                  alt={post.title} 
                  className="w-full h-full object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                {idx === 0 && (
                  <div className="absolute -top-3 -right-3">
                    <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-md animate-bounce" />
                  </div>
                )}
              </div>

              <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-xs text-slate-400 mb-2">{post.category?.name || 'App'}</p>
              
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-black/30 px-3 py-1.5 rounded-full w-full justify-center">
                <span className="flex items-center gap-1"><Download className="w-3 h-3 text-primary" /> {post.downloads || 0}</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" /> {(post.averageRating || 5).toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
