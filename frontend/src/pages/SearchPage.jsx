import { useSearchParams } from 'react-router-dom';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, Search as SearchIcon } from 'lucide-react';
import FallbackImage from '../components/FallbackImage';
import { useState } from 'react';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  const category = searchParams.get('category') || '';
  const rating = searchParams.get('rating') || '';
  const premiumOnly = searchParams.get('premiumOnly') === 'true';
  const sort = searchParams.get('sort') || '';

  const [filters, setFilters] = useState({
    category,
    rating,
    premiumOnly,
    sort,
  });

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: postsRes, isLoading, isError } = useGetPostsQuery(
    { 
      search: query, 
      category: filters.category, 
      rating: filters.rating, 
      premiumOnly: filters.premiumOnly,
      sort: filters.sort,
      limit: 20 
    }, 
    { skip: !query && !filters.category && !filters.premiumOnly && !filters.sort }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) newParams.set('q', searchInput);
    else newParams.delete('q');
    
    if (filters.category) newParams.set('category', filters.category);
    else newParams.delete('category');
    
    if (filters.rating) newParams.set('rating', filters.rating);
    else newParams.delete('rating');
    
    if (filters.premiumOnly) newParams.set('premiumOnly', 'true');
    else newParams.delete('premiumOnly');
    
    if (filters.sort) newParams.set('sort', filters.sort);
    else newParams.delete('sort');

    setSearchParams(newParams);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const posts = postsRes?.data || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <SEO 
        title={`Search results for "${query}" - ModsApp`}
        description={`Search results for "${query}" on ModsApp.`}
      />

      {/* Universal Back Button */}
      <div className="mb-4">
        <BackButton fallbackRoute="/" />
      </div>

      <div className="glass-card p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold dark:text-white mb-6">Search Results</h1>
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for apps, games, mods..."
            className="premium-input w-full px-6 py-4 rounded-full text-lg shadow-inner"
          />
          <button type="submit" className="absolute right-2 top-2 p-2 premium-btn rounded-full">
            <SearchIcon className="w-6 h-6" />
          </button>
        </form>

        {/* Filters */}
        <div className="w-full max-w-4xl mt-6 p-4 glass-card grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="premium-input w-full py-2 text-sm">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Minimum Rating</label>
            <select value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)} className="premium-input w-full py-2 text-sm">
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Sort By</label>
            <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="premium-input w-full py-2 text-sm">
              <option value="">Newest</option>
              <option value="-updateDate">Recently Updated</option>
              <option value="-downloads">Most Downloaded</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.premiumOnly} onChange={(e) => handleFilterChange('premiumOnly', e.target.checked)} className="w-4 h-4 text-primary focus:ring-primary rounded border-slate-300" />
              <span className="text-sm font-semibold dark:text-slate-300">Premium Only</span>
            </label>
          </div>
        </div>
      </div>

      {query && isLoading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}
      
      {(!isLoading && !isError) && (
        <>
          <p className="text-slate-500 font-medium mb-4">Found {postsRes?.pagination?.totalItems || posts.length} results {query && `for "${query}"`}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, idx) => (
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                key={post._id} 
                className="glass-card flex flex-col group relative overflow-hidden h-full"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500 -z-10"></div>
                
                {/* Banner Image */}
                <div className="h-36 overflow-hidden relative shrink-0">
                  <FallbackImage 
                    src={post.featuredImage} 
                    fallbackType="generic"
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                  
                  {post.isPremium && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-glow">
                      PREMIUM
                    </span>
                  )}
                  {post.isFeatured && !post.isPremium && (
                    <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3 items-start">
                      {/* App Logo */}
                      <FallbackImage 
                        src={post.appLogo} 
                        fallbackType="logo"
                        alt={`${post.title} logo`} 
                        className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 p-0.5 shrink-0 shadow-md" 
                      />
                      <div className="min-w-0 flex-1">
                        <Link to={`/post/${post.slug}`}>
                          <h3 className="font-bold text-base text-slate-800 dark:text-white hover:text-primary transition-colors truncate" title={post.title}>
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate">
                          {post.publisher || 'Verified Developer'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-3 mb-4">
                      {post.seoDescription || post.description || 'No description available for this app.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/30 dark:border-white/5 pt-3 mt-auto">
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center text-amber-500 font-bold"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {(post.averageRating || 5).toFixed(1)}</span>
                      <span className="flex items-center font-medium"><Download className="w-3.5 h-3.5 mr-1" /> {post.size || 'Varies'}</span>
                    </div>
                    
                    <Link to={`/post/${post.slug}`} className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-300 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white border border-slate-200/50 dark:border-white/5">
                      <Download className="w-3.5 h-3.5" /> Get App
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center text-slate-500 py-20 glass-card">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h2 className="text-2xl font-bold mb-2 dark:text-white">No results found</h2>
              <p>We couldn't find anything matching "{query}". Try different keywords.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
