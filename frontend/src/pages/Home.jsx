import React from 'react';
import SEO from '../components/SEO';
import NexoriaHero from '../components/Home/NexoriaHero';
import NexusGrid from '../components/Home/NexusGrid';
import EcosystemSection from '../components/Home/EcosystemSection';

const Home = () => {
  return (
    <div className="font-sans bg-transparent min-h-screen text-slate-900 dark:text-slate-50 pb-24 md:pb-20 selection:bg-blue-500/30 relative overflow-x-hidden">
      <SEO title="Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One" />
      
      <NexoriaHero />
      <NexusGrid />
      <EcosystemSection />
      
    </div>
  );
};

export default Home;
