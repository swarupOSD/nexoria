import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Smartphone, Gamepad2, Music, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import FallbackImage from '../FallbackImage';

const BottomNavigation = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const navItems = [
    { name: 'Home', path: '/', icon: Compass, activeColor: 'text-primary' },
    { name: 'Apps', path: '/apps', icon: Smartphone, activeColor: 'text-indigo-500' },
    { name: 'Games', path: '/moviebox/games', icon: Gamepad2, activeColor: 'text-blue-500' },
    { name: 'Music', path: '/nexoria-music', icon: Music, activeColor: 'text-pink-500' }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 ${isActive ? '' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? item.activeColor : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className={`absolute -bottom-3 w-1 h-1 rounded-full ${item.activeColor.replace('text-', 'bg-')}`} />
                )}
              </div>
              <span className={`text-[10px] font-semibold mt-1 transition-all duration-300 ${isActive ? item.activeColor : 'text-slate-500 dark:text-slate-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Menu/Profile Button */}
        <button 
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          {user ? (
            <div className="relative">
              <FallbackImage src={user.profileImage} fallbackType="avatar" className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 object-cover" alt="Profile" />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#0A0A0A] rounded-full p-0.5">
                <Menu className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" strokeWidth={3} />
              </div>
            </div>
          ) : (
            <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" strokeWidth={2} />
          )}
          <span className="text-[10px] font-semibold mt-1 text-slate-500 dark:text-slate-400">
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
