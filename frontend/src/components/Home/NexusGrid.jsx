import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, PlaySquare, Music, Smartphone, Flame, Star, ArrowRight } from 'lucide-react';

const NexusGrid = () => {
  return (
    <section id="nexus-grid" className="py-24 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
        
        {/* Gaming - Large Feature */}
        <Link to="/moviebox/games" className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 hover:shadow-[0_8px_40px_rgba(76,215,246,0.15)] hover:-translate-y-1 transition-all duration-500 bg-[#06080a]">
          <img src="/assets/nexus/nexus-gaming.png" alt="Gaming Arena" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.05] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[2]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-tertiary">
              <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_12px_#4cd7f6] group-hover:shadow-[0_0_20px_#4cd7f6] transition-shadow duration-500"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">GAMING</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-4xl text-white mb-3 font-bold tracking-tight drop-shadow-md">Immersive Worlds Await</h2>
              <div className="flex items-center gap-2 text-tertiary font-body-md group-hover:translate-x-2 transition-transform duration-500 font-semibold tracking-wide">
                <span>ENTER ARENA</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>

        {/* MovieBox */}
        <Link to="/moviebox" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-primary-container/60 hover:shadow-[0_8px_30px_rgba(160,120,255,0.12)] hover:-translate-y-1 transition-all duration-500 bg-[#0a0614]">
          <img src="/assets/nexus/nexus-moviebox.png" alt="MovieBox" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-[#0a0614]/40 to-transparent z-[2]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-primary-container">
              <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#a078ff] group-hover:shadow-[0_0_15px_#a078ff] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">MOVIEBOX</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Cinema</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <PlaySquare className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
               </div>
            </div>
          </div>
        </Link>

        {/* Apps */}
        <Link to="/apps" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all duration-500 bg-[#060814]">
          <img src="/assets/nexus/nexus-appstore.png" alt="App Store" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060814] via-[#060814]/40 to-transparent z-[2]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] group-hover:shadow-[0_0_15px_#818cf8] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">APP STORE</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Tools & Utility</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <Smartphone className="w-4 h-4" />
               </div>
            </div>
          </div>
        </Link>

        {/* Music */}
        <Link to="/nexoria-music" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-rose-500/50 hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)] hover:-translate-y-1 transition-all duration-500 bg-[#120508]">
          <img src="/assets/nexus/nexus-music.png" alt="Music" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120508] via-[#120508]/40 to-transparent z-[2]"></div>
            
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185] group-hover:shadow-[0_0_15px_#fb7185] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">MUSIC</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Rhythm</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <Music className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
               </div>
            </div>
          </div>
        </Link>
        
        {/* Arena */}
        <Link to="/nexoria-arena" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:-translate-y-1 transition-all duration-500 bg-[#140a02]">
          <img src="/assets/nexus/nexus-arena.png" alt="Arena" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140a02] via-[#140a02]/40 to-transparent z-[2]"></div>
            
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] group-hover:shadow-[0_0_15px_#fbbf24] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">ARENA</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Compete</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <Gamepad2 className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
               </div>
            </div>
          </div>
        </Link>

        {/* Aura & Community */}
        <Link to="/aura" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] hover:-translate-y-1 transition-all duration-500 bg-[#140804]">
          <img src="/assets/nexus/nexus-aura.png" alt="Aura" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140804] via-[#140804]/40 to-transparent z-[2]"></div>
            
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c] group-hover:shadow-[0_0_15px_#fb923c] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">AURA</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Community</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <Flame className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
               </div>
            </div>
          </div>
        </Link>

        {/* Premium */}
        <Link to="/premium" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-yellow-500/20 hover:border-yellow-400/50 hover:shadow-[0_8px_30px_rgba(250,204,21,0.15)] hover:-translate-y-1 transition-all duration-500 bg-[#121004]">
          <img src="/assets/nexus/nexus-premium.png" alt="Premium" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-[1.06] z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121004] via-[#121004]/40 to-transparent z-[2]"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] group-hover:shadow-[0_0_15px_#facc15] transition-shadow"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-shadow-sm">PREMIUM</span>
            </div>
            <div className="mt-auto flex justify-between items-end group-hover:translate-y-[-2px] transition-transform duration-500">
               <div>
                  <h3 className="font-headline-md text-white mb-1 font-bold tracking-tight drop-shadow-md">Unlock All</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500 group-hover:text-[#121004] group-hover:scale-110 transition-all duration-500 shadow-lg">
                 <Star className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
               </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default NexusGrid;
