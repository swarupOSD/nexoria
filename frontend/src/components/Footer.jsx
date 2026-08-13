import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, Heart, ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import AdPlacement from './AdPlacement';
import Logo from './Logo';
import { motion } from 'framer-motion';

const Footer = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const design = settings.footerDesign || { theme: 'dark', glassIntensity: 'backdrop-blur-2xl', gradientColors: 'from-primary/10 to-accent/10' };
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  const isDarkTheme = design.theme === 'dark';
  const glassClasses = `bg-white/80 dark:bg-[#030303]/90 ${design.glassIntensity}`;
  
  // We will append Quick Links to the Company section or Resources section to keep it clean.
  const quickLinks = settings.quickLinks || [];

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10 pt-stitch-xl pb-stitch-lg mt-stitch-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="col-span-2 lg:col-span-2 flex flex-col gap-stitch-md">
          <span className="font-headline-md text-on-surface">{settings?.siteName || 'Nexoria'}</span>
          <p className="font-body-md text-on-surface-variant max-w-xs">{settings.footerText || 'Digital Luxury Defined. The premier hub for curated digital experiences.'}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.keys(settings.socialLinks || {}).map(network => {
              const url = settings.socialLinks[network];
              if (!url || settings.disabledSocialLinks?.includes(network)) return null;
              const brandColors = { facebook: '#1877F2', twitter: '#1DA1F2', instagram: '#E4405F', youtube: '#FF0000', discord: '#5865F2', telegram: '#229ED9', whatsapp: '#25D366', linkedin: '#0A66C2', github: '#181717' };
              return (
                <a key={network} href={url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-surface-variant hover:bg-surface-bright flex items-center justify-center transition-all">
                  <div className="w-4 h-4" style={{ backgroundColor: brandColors[network] || '#888', mask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain`, WebkitMask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain` }} />
                </a>
              );
            })}
          </div>
          <p className="font-label-caps text-on-surface-variant mt-auto pt-stitch-md border-t border-outline-variant/10">© {currentYear} {settings?.siteName || 'Nexoria Hub'}. {settings.copyrightText || 'Digital Luxury Defined.'}</p>
        </div>
        
        <div className="flex flex-col gap-stitch-sm">
          <h4 className="font-label-caps text-on-surface mb-stitch-sm">Platform</h4>
          <Link to="/apps" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Apps</Link>
          <Link to="/moviebox" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Movies</Link>
          <Link to="/nexoria-music" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Music</Link>
          <Link to="/moviebox/games" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Games</Link>
        </div>
        
        <div className="flex flex-col gap-stitch-sm">
          <h4 className="font-label-caps text-on-surface mb-stitch-sm">Legal</h4>
          <Link to="/privacy-policy" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/dmca" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">DMCA</Link>
        </div>
        
        <div className="flex flex-col gap-stitch-sm">
          <h4 className="font-label-caps text-on-surface mb-stitch-sm">Support</h4>
          <Link to="/support" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Help Center</Link>
          <span className="font-body-md text-on-surface-variant/50 cursor-not-allowed">Career</span>
          <Link to="/premium" className="font-body-md text-on-surface-variant hover:text-primary transition-colors">Premium</Link>
          {quickLinks.map((link, index) => (
             <Link key={index} to={link.url} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">{link.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
