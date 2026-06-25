import { useParams, Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import SEO from '../components/SEO';

const Legal = () => {
  const { pageSlug } = useParams();
  const { data: settingsRes } = useGetSettingsQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const { data: postsRes } = useGetPostsQuery({ limit: 100 });
  
  const settings = settingsRes?.data || {};
  const categories = categoriesRes?.data || [];
  const posts = postsRes?.data?.posts || [];
  
  const siteName = settings.siteName || 'Our Website';
  const email = settings.contactEmail || 'contact@example.com';
  
  const getContent = () => {
    switch (pageSlug) {
      case 'privacy-policy':
        return {
          title: 'Privacy Policy',
          body: `
            <h2>1. Introduction</h2>
            <p>Welcome to ${siteName}. We respect your privacy and are committed to protecting your personal data.</p>
            <h2>2. Data We Collect</h2>
            <p>We may collect email addresses when you register, and tracking data such as IP address and browser type for analytical purposes.</p>
            <h2>3. Contact Us</h2>
            <p>If you have any questions, contact us at ${email}.</p>
          `
        };
      case 'terms':
      case 'terms-of-service':
        return {
          title: 'Terms of Service',
          body: `
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing ${siteName}, you agree to be bound by these Terms of Service.</p>
            <h2>2. Use License</h2>
            <p>The applications provided are for personal, non-commercial use.</p>
            <h2>3. Disclaimer</h2>
            <p>The materials on ${siteName} are provided on an 'as is' basis. Contact ${email} for support.</p>
          `
        };
      case 'dmca':
        return {
          title: 'DMCA Disclaimer',
          body: `
            <h2>1. Copyright Infringement</h2>
            <p>If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, contact us at ${email}.</p>
            <h2>2. Takedown Requests</h2>
            <p>Send a detailed email with proof of ownership, and we will remove the content within 48 hours.</p>
          `
        };
      case 'about':
        return {
          title: 'About Us',
          body: `
            <h2>About ${siteName}</h2>
            <p>Welcome to ${siteName}. We are dedicated to providing the best premium apps and games for our users.</p>
            <p>If you have questions, please reach out to us via our Contact page or at ${email}.</p>
          `
        };
      case 'sitemap':
        return {
          title: 'Sitemap',
          isSitemap: true
        };
      default:
        return null;
    }
  };

  const data = getContent();

  if (!data) {
    return <div className="text-center mt-20 text-red-500 font-bold text-2xl">Page Not Found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <SEO 
        title={data.title}
        description={`Read the ${data.title} of ${siteName}.`}
      />

      <div className="glass-card p-10">
        <h1 className="text-4xl font-bold mb-8 dark:text-white border-b pb-4 dark:border-slate-700">{data.title}</h1>
        {data.isSitemap ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700 dark:text-slate-300">
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Main Pages</h2>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
                <li><Link to="/contact" className="hover:text-blue-500">Contact Us</Link></li>
                <li><Link to="/legal/about" className="hover:text-blue-500">About Us</Link></li>
                <li><Link to="/legal/privacy-policy" className="hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link to="/legal/dmca" className="hover:text-blue-500">DMCA</Link></li>
                <li><Link to="/legal/terms" className="hover:text-blue-500">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">Categories</h2>
              <ul className="space-y-2">
                {categories.map(c => (
                  <li key={c._id}><Link to={`/category/${c.slug}`} className="hover:text-blue-500">{c.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-200"
            dangerouslySetInnerHTML={{ __html: data.body }}
          ></div>
        )}
        <p className="mt-10 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Legal;
