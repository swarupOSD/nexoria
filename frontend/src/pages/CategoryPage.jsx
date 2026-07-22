import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, ChevronRight } from 'lucide-react';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import CustomSearchBar from '../components/CustomSearchBar';
import FallbackImage from '../components/FallbackImage';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

const AppCard = React.memo(({ app }) => {
  const isPremium = app.isPremium || app.premiumOnly;
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Link to={`/post/${app.slug}`} className="group block h-full">
        <div className="bg-white/5 dark:bg-[#0A0A0A]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(168,85,247,0.05)] hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)] hover:border-purple-500/50 transition-all duration-500 h-full flex flex-col gap-4 relative overflow-hidden group/card">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
          <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-black/5 dark:bg-white/5 backdrop-blur-md shadow-inner z-10 border border-white/5">
            <FallbackImage src={app.appLogo} fallbackType="logo" alt={app.title} className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl" />
          {isPremium && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider backdrop-blur-md border border-white/20">
              PRO
            </div>
          )}
        </div>
        <div className="space-y-1 mt-auto">
          <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">{app.title}</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {app.averageRating || '4.5'}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {app.downloads > 1000 ? (app.downloads/1000).toFixed(1)+'k' : (app.downloads || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  );
});

const CategoryPage = ({ type }) => {
  const { slug } = useParams();
  
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];
  const currentCategory = categories.find(c => c.slug === slug);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryParams = {
    page,
    limit: 20,
    search: searchTerm
  };
  if (slug) queryParams.category = slug;
  if (type) queryParams.type = type;

  const { data: postsRes, isLoading, isError } = useGetPostsQuery(queryParams, {
    skip: !slug && !type,
    refetchOnMountOrArgChange: true
  });
  
  const posts = postsRes?.data || [];
  const totalPages = postsRes?.pagination?.total || 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, type, page]);

  // Determine Title & Description
  const isAppHub = type === 'App' && !slug;
  const pageTitle = isAppHub ? 'Nexoria Studio' : (currentCategory ? currentCategory.name : 'Category');
  const pageDesc = isAppHub ? 'Discover premium modded apps, tools, and utilities.' : (currentCategory?.description || `Browse the best applications and mods.`);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pb-20">
      <SEO title={`${pageTitle} - PremiumApps`} />
      
      {/* Category Banner / Hero */}
      <div className="relative bg-[#111] border-b border-white/5 overflow-hidden mb-10">
        <div className="absolute top-6 left-6 z-20">
          <BackButton fallbackRoute="/" />
        </div>
        {currentCategory?.banner && !isAppHub && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" 
            style={{ backgroundImage: `url(${currentCategory.banner})` }}
          />
        )}
        {isAppHub && (
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-[#0A0A0A]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
        
        <div className="relative container mx-auto px-4 pt-16 pb-12 text-center max-w-3xl z-10 perspective-1000">
          <motion.h1 
            initial={{ opacity: 0, y: 20, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            className={`text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl tracking-tight ${isAppHub ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500' : 'text-white'}`}
          >
            {pageTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl font-medium drop-shadow-md bg-black/20 backdrop-blur-md inline-block px-6 py-2 rounded-full border border-white/5"
          >
            {pageDesc}
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-[#111] rounded-2xl border border-white/5 p-6 sticky top-24">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm text-slate-400">All Categories</h3>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link 
                    to={`/category/${cat.slug}`} 
                    className={`block py-2.5 px-4 rounded-xl transition-colors font-medium flex items-center justify-between group ${cat.slug === slug ? 'bg-primary/20 text-primary' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat.name}
                    <ChevronRight className={`w-4 h-4 transition-transform ${cat.slug === slug ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4 space-y-8">
          
          <div className="relative flex justify-center mt-2">
            <CustomSearchBar 
              placeholder={`Search in ${currentCategory?.name || slug}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div></div>
          ) : isError ? (
            <div className="text-center py-20 text-rose-500 bg-white/5 dark:bg-[#111]/50 backdrop-blur-xl rounded-3xl border border-rose-500/20 shadow-2xl">Failed to load applications.</div>
          ) : posts.length === 0 ? (
            <div className="bg-white/5 dark:bg-[#111]/50 backdrop-blur-xl rounded-3xl border border-white/10 p-20 text-center shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Apps Found</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium">There are currently no apps in this category matching your search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {posts.map(app => <AppCard key={app._id} app={app} />)}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-5 py-2.5 bg-[#111] border border-white/10 rounded-xl text-white font-medium hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold">
                    {page}
                  </span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-5 py-2.5 bg-[#111] border border-white/10 rounded-xl text-white font-medium hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
