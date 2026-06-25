import React from 'react';
import { Search } from 'lucide-react';

const CustomSearchBar = ({ value, onChange, onFocus, placeholder, name = "text", className = "" }) => {
  return (
    <div className={`relative w-full group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder || "Search apps, games, movies..."}
        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-2xl pl-10 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-400 backdrop-blur-sm"
        autoComplete="off"
      />
    </div>
  );
};

export default CustomSearchBar;
