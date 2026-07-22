import { useParams, Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import { useGetCategoriesQuery } from '../features/category/categoryApiSlice';
import { useGetPostsQuery } from '../features/post/postApiSlice';
import SEO from '../components/SEO';
import BackButton from '../components/BackButton';

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
    <div className="font-jakarta bg-[#030303] min-h-screen text-white pt-24 pb-12 transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
      </div>
      <div className="max-w-4xl mx-auto space-y-8 relative z-10 px-4">
      <SEO 
        title={data.title}
        description={`Read the ${data.title} of ${siteName}.`}
      />

      <div className="mb-6">
        <BackButton fallbackRoute="/" />
      </div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <h1 className="text-4xl font-black mb-8 text-white border-b border-white/10 pb-6 tracking-tight">{data.title}</h1>
        {data.isSitemap ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/70 font-medium">
            <div>
              <h2 className="text-2xl font-black mb-6 border-b border-white/10 pb-4 text-white">Main Pages</h2>
              <ul className="space-y-3">
                <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Home</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Contact Us</Link></li>
                <li><Link to="/legal/about" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> About Us</Link></li>
                <li><Link to="/legal/privacy-policy" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Privacy Policy</Link></li>
                <li><Link to="/legal/dmca" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> DMCA</Link></li>
                <li><Link to="/legal/terms" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-black mb-6 border-b border-white/10 pb-4 text-white">Categories</h2>
              <ul className="space-y-3">
                {categories.map(c => (
                  <li key={c._id}><Link to={`/category/${c.slug}`} className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> {c.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-invert max-w-none prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight prose-p:text-white/70 prose-p:font-medium prose-p:leading-relaxed prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: data.body }}
          ></div>
        )}
        <p className="mt-10 text-sm font-bold text-white/30 uppercase tracking-wider border-t border-white/10 pt-6">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
    </div>
  );
};

export default Legal;
