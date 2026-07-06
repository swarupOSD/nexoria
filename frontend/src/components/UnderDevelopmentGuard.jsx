import React from 'react';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const UnderDevelopmentGuard = ({ moduleName, children }) => {
  const { data: settingsRes, isLoading } = useGetSettingsQuery();
  const { user } = useSelector(state => state.auth);
  
  if (isLoading) return null;

  const isUnderDevelopment = settingsRes?.data?.underDevelopmentModules?.[moduleName] === true;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  if (isUnderDevelopment && !isAdmin) {
    return (
      <div className="p-4 sm:p-8 min-h-[70vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
        
        <div className="bg-[#111]/40 backdrop-blur-3xl border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl hover:border-red-500/30 transition-all duration-500 group transform hover:-translate-y-2">
          <div className="text-6xl md:text-8xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 inline-block drop-shadow-2xl">🚧</div>
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-6 tracking-tight drop-shadow-lg">Under Development</h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            The <strong className="uppercase">{moduleName.replace(/([A-Z])/g, ' $1').trim()}</strong> module is currently under active development and testing. It will be available to all users soon!
          </p>
          
          <div className="relative inline-block group/btn cursor-wait">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-md opacity-50 group-hover/btn:opacity-100 transition-opacity animate-pulse"></div>
            <div className="relative px-8 py-4 bg-black/50 backdrop-blur-md text-white font-bold text-lg rounded-xl border border-white/10 flex items-center gap-3">
              🛠️ <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default UnderDevelopmentGuard;
