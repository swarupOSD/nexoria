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
    <footer className={`mt-20 border-t border-slate-200/50 dark:border-white/5 relative overflow-hidden ${glassClasses}`}>
      
      {/* Dynamic Background Image */}
      {design.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-50 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${design.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      )}

      {/* Dynamic Gradients */}
      {design.animationEnabled && (
        <>
          <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r ${design.gradientColors} rounded-full blur-[100px] pointer-events-none -translate-y-1/2`}></div>
          <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l ${design.gradientColors} rounded-full blur-[100px] pointer-events-none -translate-y-1/2`}></div>
        </>
      )}

      <div className="container mx-auto px-6 relative z-10">
        
        <AdPlacement location="Footer" className="my-8 rounded-2xl overflow-hidden shadow-sm" />

        {/* Dynamic Newsletter */}
        {settings.newsletter?.enabled && (
          <div className="bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl mb-16">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">
                {settings.newsletter?.title || 'Join the Premium Community'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {settings.newsletter?.description || 'Get exclusive updates, early access to premium mods, and weekly newsletters delivered directly to your inbox.'}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full md:w-auto relative flex-1 max-w-lg">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-full py-3.5 px-6 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={subscribed}
                  className={`w-full sm:w-auto py-3.5 px-8 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${subscribed ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black shadow-md hover:scale-105 active:scale-95'}`}
                >
                  {subscribed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </motion.div>
                  ) : (
                    <>Subscribe <Send className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clean 4-Column Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand, Contact & Social */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {settings.logo && <Logo src={settings.logo} className="!w-auto !h-10" />}
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {settings?.siteName || 'Nexoria'}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">{settings?.siteName || 'Nexoria'} — Your Entertainment Universe.</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
              {settings.footerText || settings.metaDescription || 'Download the best premium mods and apps securely from our platform.'}
            </p>

            {/* Compact Contact Info */}
            <div className="space-y-2 pt-2">
              {settings.supportEmail && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary transition-colors">{settings.supportEmail}</a>
                </div>
              )}
              {settings.phoneNumber && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <a href={`tel:${settings.phoneNumber}`} className="hover:text-accent transition-colors">{settings.phoneNumber}</a>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              {Object.keys(settings.socialLinks || {}).map(network => {
                const url = settings.socialLinks[network];
                const isDisabled = settings.disabledSocialLinks?.includes(network);
                if (!url || isDisabled) return null;

                const brandColors = {
                  facebook: '#1877F2', twitter: '#1DA1F2', instagram: '#E4405F',
                  youtube: '#FF0000', discord: '#5865F2', telegram: '#229ED9',
                  whatsapp: '#25D366', linkedin: '#0A66C2', github: '#181717'
                };
                
                return (
                  <a key={network} href={url} target="_blank" rel="noreferrer" 
                     aria-label={`Visit our ${network} page`}
                     className="group w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                    <div 
                      className="w-4 h-4 transition-transform group-hover:scale-110"
                      style={{ 
                        backgroundColor: brandColors[network] || '#888',
                        WebkitMask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain`,
                        mask: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${network}.svg) no-repeat center / contain`
                      }}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about-us" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link to="/support" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Contact Us</Link></li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium cursor-not-allowed flex items-center gap-2">
                  Careers <span className="text-[9px] uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
                </span>
              </li>
              {/* Inject CMS Quick Links here so they aren't lost */}
              {quickLinks.map((link, index) => (
                <li key={`ql-${index}`}>
                  <Link to={link.url} className="text-primary hover:text-primary-600 dark:text-primary dark:hover:text-primary-400 transition-colors text-sm font-bold flex items-center gap-1 group">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Terms of Service</Link></li>
              <li><Link to="/dmca" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">DMCA Disclaimer</Link></li>
              <li><Link to="/privacy-policy" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/sitemap" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Sitemap</Link></li>
              <li><Link to="/support" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">FAQs</Link></li>
              <li><Link to="/support" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Support Center</Link></li>
              <li><Link to="/premium" className="text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors font-bold flex items-center gap-2">Premium Membership</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-8 gap-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            © {currentYear} <span className="font-bold text-slate-700 dark:text-slate-300">Nexoria</span>. {settings.copyrightText || 'All Rights Reserved.'}
          </p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" /> for the community.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
