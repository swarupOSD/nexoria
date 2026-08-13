import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, PlaySquare, Music, Smartphone, Flame, Star } from 'lucide-react';

const NexusGrid = () => {
  return (
    <section id="nexus-grid" className="py-24 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
        
        {/* Gaming - Large Feature */}
        <Link to="/moviebox/games" className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-2xl bg-surface-container-lowest">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB02IsfmKCdfNZagFUwWZ4xImqygKLln994vqkjkzvAq3GvGyZFIkvkg-gQfPGkYM_eFafuPZ7v33FpIFfq928ow60iy2QJy1YooQKUBkS76g176Dth5QNJLMMgweI__-bB2OCUoDk33y3wiw4-cWNG3hEtL4yQz0PsQ0IT8N93ohRRGo3EzimbHgz1ZpPrvUJKkFOyvPWxxwaOHUPb6t5hMUlYD8nNUzIJubT0vf_qLgSsCwJeJeCX')" }}
          ></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-tertiary">
              <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4cd7f6]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">GAMING</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-4xl text-on-surface mb-2 font-bold tracking-tight">Immersive Worlds Await</h2>
              <div className="flex items-center gap-2 text-tertiary font-body-md group-hover:translate-x-2 transition-transform">
                <span>ENTER ARENA</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </Link>

        {/* MovieBox */}
        <Link to="/moviebox" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-lowest">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/30 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-primary-container">
              <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#a078ff]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">MOVIEBOX</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Cinema</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                 <PlaySquare className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>

        {/* Apps */}
        <Link to="/apps" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-lowest">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">APP STORE</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Tools & Utility</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                 <Smartphone className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>

        {/* Music */}
        <Link to="/nexoria-music" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-lowest">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">MUSIC</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Rhythm</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                 <Music className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>
        
        {/* Arena */}
        <Link to="/nexoria-arena" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-lowest">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">ARENA</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Compete</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                 <Gamepad2 className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>

        {/* Aura & Community */}
        <Link to="/aura" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-lowest">
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]"></div>
              <span className="font-label-caps text-label-caps tracking-widest">AURA</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Community</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                 <Flame className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>

        {/* Premium */}
        <Link to="/premium" className="md:col-span-1 lg:col-span-1 rounded-3xl p-6 relative overflow-hidden group border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-lg bg-surface-container-highest">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]"></div>
              <span className="font-label-caps text-label-caps tracking-widest text-yellow-400">PREMIUM</span>
            </div>
            <div className="mt-auto flex justify-between items-end">
               <div>
                  <h3 className="font-headline-md text-on-surface mb-1 font-bold">Unlock All</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                 <Star className="w-5 h-5" />
               </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default NexusGrid;
