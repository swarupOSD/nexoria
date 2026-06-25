import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetSettingsQuery } from '../../features/settings/settingsApiSlice';
import { useGetCategoriesQuery } from '../../features/category/categoryApiSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Map, Folder, FileText, Lock, Globe, ChevronLeft, ArrowRight } from 'lucide-react';

const Sitemap = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const navigate = useNavigate();

  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sitemapGroups = [
    {
      title: "Main Pages",
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      links: [
        { name: "Homepage", url: "/" },
        { name: "All Categories", url: "/categories" },
        { name: "Search Apps", url: "/search" },
        { name: "Premium Membership", url: "/premium" }
      ]
    },
    {
      title: "Authentication",
      icon: <Lock className="w-5 h-5 text-rose-500" />,
      links: [
        { name: "Login", url: "/login" },
        { name: "Register", url: "/register" },
        { name: "Forgot Password", url: "/forgot-password" }
      ]
    },
    {
      title: "Legal & Information",
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      links: [
        { name: "About Us", url: "/about-us" },
        { name: "Contact Us", url: "/contact" },
        { name: "Privacy Policy", url: "/privacy-policy" },
        { name: "Terms of Service", url: "/terms-of-service" },
        { name: "DMCA Disclaimer", url: "/dmca" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500">
      <Helmet>
        <title>Sitemap - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Complete sitemap and directory." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-5xl relative">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-x-1 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-10 md:p-16 text-center border border-slate-200 dark:border-slate-700/50 shadow-sm mb-12"
        >
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <Map className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Sitemap Directory</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Find exactly what you're looking for with our complete site directory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Static Groups */}
          {sitemapGroups.map((group, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  {group.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{group.title}</h2>
              </div>
              <ul className="space-y-3">
                {group.links.map((link, i) => (
                  <li key={i}>
                    <Link to={link.url} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium">
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Dynamic Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Folder className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Categories</h2>
            </div>
            {categories.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <Link to={`/category/${cat.slug}`} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium">
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm font-medium">No categories found.</p>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Sitemap;
