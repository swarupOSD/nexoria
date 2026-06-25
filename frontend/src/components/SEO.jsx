import { Helmet } from 'react-helmet-async';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  
  const seoTitle = title ? `${title} - Nexoria` : (settings.metaTitle || 'Nexoria – Movies, K-Dramas, Anime, Games, Music & Premium Apps | All In One');
  const seoDescription = description || settings.metaDescription || 'Nexoria unites movies, K-Dramas, anime, mobile & kids games, music, editing tools and premium apps in one futuristic platform. Explore now.';
  const seoKeywords = keywords || settings.keywords || 'apk, mod, games, premium';
  const seoImage = image || settings.defaultOgImage || settings.logo || '';
  const canonicalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Nexoria" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
    </Helmet>
  );
};

export default SEO;
