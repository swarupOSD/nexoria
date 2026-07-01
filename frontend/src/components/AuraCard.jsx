import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Flame, Trophy, Share2 } from 'lucide-react';
import { useGetPersonalAuraQuery } from '../features/aura/auraApiSlice';
import FallbackImage from './FallbackImage';
import toast from 'react-hot-toast';

const AuraCard = () => {
  const { data: auraRes, isLoading, isError } = useGetPersonalAuraQuery();
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (isError || !auraRes?.data) return <div className="p-6 text-center text-slate-500">Could not load Aura Card.</div>;

  const aura = auraRes.data;

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      toast.loading('Generating Aura Card...', { id: 'export' });
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#050505',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Nexoria_Aura_${aura.username}.png`;
      link.click();
      
      toast.success('Aura Card downloaded!', { id: 'export' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The Shareable Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-[400px] relative rounded-[2rem] overflow-hidden p-8 shadow-2xl"
        style={{
          background: `linear-gradient(145deg, #111 0%, #050505 100%)`,
          boxShadow: `0 20px 50px -12px ${aura.color}40`,
          border: `1px solid ${aura.color}30`
        }}
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-40 mix-blend-screen pointer-events-none" style={{ backgroundColor: aura.color, transform: 'translate(30%, -30%)' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-20 mix-blend-screen pointer-events-none" style={{ backgroundColor: aura.color, transform: 'translate(-30%, 30%)' }}></div>
        
        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: aura.color }} />
            <span className="font-black tracking-widest uppercase text-white/90 text-sm">Nexoria Aura</span>
          </div>
          <div className="px-3 py-1 rounded-full border bg-black/40 backdrop-blur-md" style={{ borderColor: `${aura.color}50` }}>
            <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: aura.color }}>{aura.tier}</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${aura.color}, transparent)` }}>
              <img 
                src={aura.avatar || '/default-avatar.png'} 
                alt={aura.username} 
                className="w-full h-full rounded-full object-cover border-2 border-black" 
                crossOrigin="anonymous"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <Trophy className="w-4 h-4" style={{ color: aura.color }} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">{aura.username}</h2>
          <p className="text-xs text-white/60 font-medium">Ranked #{Math.floor(Math.random() * 500) + 1} Globably</p>
        </div>

        {/* Aura Score */}
        <div className="relative z-10 flex flex-col items-center justify-center py-6 border-y border-white/10 mb-8 bg-black/20 rounded-2xl backdrop-blur-sm">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Total Aura Power</span>
          <h1 className="text-6xl font-black tracking-tighter" style={{ 
            color: aura.color, 
            textShadow: `0 0 20px ${aura.color}80`
          }}>
            {aura.personalScore}
          </h1>
          <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Contributed {aura.votedIn} Vibe Votes
          </p>
        </div>

        {/* Top Vibed Items */}
        {aura.topVibes && aura.topVibes.length > 0 && (
          <div className="relative z-10">
            <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Top Contributions</h4>
            <div className="space-y-2">
              {aura.topVibes.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-sm font-medium text-white/90 truncate max-w-[70%]">{item.title}</span>
                  <span className="text-xs font-bold" style={{ color: aura.color }}>{item.score} Aura</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer Brand */}
        <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex justify-between items-center opacity-60">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white">Nexoria Universe</span>
          <span className="text-[9px] font-medium text-white">nexoria.com</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full max-w-[400px]">
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-70"
        >
          {isExporting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download className="w-5 h-5" />}
          {isExporting ? 'Generating...' : 'Save Card'}
        </button>
      </div>
    </div>
  );
};

export default AuraCard;
