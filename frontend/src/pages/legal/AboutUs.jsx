import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetSettingsQuery } from '../../features/settings/settingsApiSlice';
import { Users, Star, Target, Zap, ShieldCheck, Download, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { label: "Active Users", value: "2M+", icon: <Users className="w-5 h-5" /> },
    { label: "Safe Apps", value: "50k+", icon: <ShieldCheck className="w-5 h-5" /> },
    { label: "Daily Downloads", value: "100k+", icon: <Download className="w-5 h-5" /> },
    { label: "Premium Mods", value: "5k+", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500 overflow-hidden">
      <Helmet>
        <title>About Us - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Learn more about our mission and vision." />
      </Helmet>

      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-x-1 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary font-bold rounded-full text-sm">
              <Star className="w-4 h-4" /> The Premium Experience
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Redefining the <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">App Ecosystem</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {settings.aboutUsText || 'We are a dedicated team of enthusiasts and developers passionate about bringing you the safest, fastest, and most premium application modifications available on the web.'}
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/contact" className="px-8 py-3.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-1">
                Contact Our Team
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-[3rem] blur-2xl opacity-30"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Team" 
              className="relative z-10 w-full h-[400px] object-cover rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800"
            />
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20"><Target className="w-32 h-32" /></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4">Our Mission</h2>
              <p className="text-white/90 text-lg font-medium leading-relaxed">
                To provide a secure, virus-free, and high-speed platform where users can access premium digital content without barriers. We believe in democratizing access to professional tools and entertainment.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="w-32 h-32" /></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4">Our Vision</h2>
              <p className="text-white/90 text-lg font-medium leading-relaxed">
                To become the world's most trusted alternative app repository, setting industry standards for safety, community moderation, and seamless user experience.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
