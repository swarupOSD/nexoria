import React, { useEffect } from 'react';
import { useGetHeroDisplaysQuery } from '../features/heroDisplay/heroDisplayApiSlice';

const HeroDisplay = ({ position, className = '' }) => {
  const { data: res, isLoading, error } = useGetHeroDisplaysQuery();

  useEffect(() => {
    console.log("HeroDisplay mounted");
  }, []);

  console.log("API response", res);

  if (isLoading) return null;

  const displays = res?.data || [];
  const activeDisplays = displays.filter(d => d.isActive && d.position === position);
  
  console.log("Filtered displays", activeDisplays);

  if (activeDisplays.length === 0) return null;

  const sortedDisplays = [...activeDisplays].sort((a, b) => a.order - b.order);

  return (
    <div className={`space-y-4 ${className}`}>
      {sortedDisplays.map((display) => (
        <div key={display._id} className="relative rounded-xl overflow-hidden shadow-sm group">
          <img src={display.image} alt={display.title} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm">{display.title}</h3>
            {display.subtitle && <p className="text-slate-200 text-xs mt-1">{display.subtitle}</p>}
            {display.actionLink && (
              <a href={display.actionLink} className="mt-2 text-[10px] uppercase font-bold text-primary hover:text-white transition-colors">
                {display.actionText || 'Read More'}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroDisplay;
