import React from 'react';
import { Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import Logo from './Logo';

const Footer = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-outline-variant/10 bg-background pt-16 pb-8 relative overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-t-full pointer-events-none"></div>
      
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Socials */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-[0_0_15px_rgba(208,188,255,0.3)]">
                <Logo src={settings.logo} />
              </div>
              <span className="font-display-sm text-xl font-bold tracking-tighter text-on-surface">
                {settings?.siteName || 'Nexoria'}
              </span>
            </Link>
            <p className="font-body-md text-on-surface-variant max-w-xs mb-4">
              {settings.footerText || 'Digital Luxury Defined. The premier hub for curated digital experiences.'}
            </p>
            
            {/* Dynamic Social Links */}
            <div className="flex flex-wrap gap-3 mt-auto">
              {Object.keys(settings.socialLinks || {}).map(network => {
                const url = settings.socialLinks[network];
                if (!url || settings.disabledSocialLinks?.includes(network)) return null;
                const brandColors = { facebook: '#1877F2', twitter: '#1DA1F2', instagram: '#E4405F', youtube: '#FF0000', discord: '#5865F2', telegram: '#229ED9', whatsapp: '#25D366', linkedin: '#0A66C2', github: '#181717' };
                return (
                  <a key={network} href={url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-surface-variant hover:bg-surface-bright flex items-center justify-center transition-all group border border-outline-variant/30 hover:border-primary/50">
                    <div className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: brandColors[network] || '#888', mask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain`, WebkitMask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain` }} />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-label-caps text-on-surface tracking-widest text-sm">Platform</h4>
            <Link to="/apps" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Apps</Link>
            <Link to="/moviebox" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Movies</Link>
            <Link to="/nexoria-music" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Music</Link>
            <Link to="/moviebox/games" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Games</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-label-caps text-on-surface tracking-widest text-sm">Community</h4>
            <Link to="/aura" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Aura Leaderboard</Link>
            <Link to="/nexoria-arena" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Arena</Link>
            <Link to="/premium" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Premium</Link>
            <Link to="/requests" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Requests</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-label-caps text-on-surface tracking-widest text-sm">Legal</h4>
            <Link to="/privacy-policy" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/dmca" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">DMCA</Link>
            <Link to="/support" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Help Center</Link>
          </div>
        </div>
        
        <div className="pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-on-surface-variant">© {currentYear} {settings?.siteName || 'Nexoria Hub'}. {settings.copyrightText || 'All rights reserved.'}</p>
        </div>
        
        <h1 className="text-4xl md:text-8xl font-black text-center text-on-surface-variant/5 tracking-tighter uppercase pointer-events-none mt-12 mb-4">
          THE NEXUS OF YOUR DIGITAL WORLD
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
