import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetSettingsQuery } from '../../features/settings/settingsApiSlice';
import { Shield, Eye, Lock, Globe, Server, FileText, Settings, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: <Database className="w-6 h-6 text-blue-500" />,
      content: (
        <>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            We collect information to provide better services to all our users. The types of personal information we obtain include:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 marker:text-primary">
            <li><strong>Account Information:</strong> Name, email address, password, and profile picture when you register.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our Services, including downloads, searches, and pages visited.</li>
            <li><strong>Device Information:</strong> Hardware model, operating system version, unique device identifiers, and mobile network information.</li>
            <li><strong>Location Data:</strong> IP address and generalized location to prevent fraud and customize your experience.</li>
          </ul>
        </>
      )
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Settings className="w-6 h-6 text-indigo-500" />,
      content: (
        <>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            We use the information we collect from all our services to provide, maintain, protect, and improve them, to develop new ones, and to protect {settings.siteName || 'our platform'} and our users.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 marker:text-primary">
            <li>To process your premium transactions securely.</li>
            <li>To send you important notices, such as communications about purchases and changes to our terms.</li>
            <li>To personalize your experience and deliver content relevant to your interests.</li>
            <li>To monitor metrics such as total number of visitors, traffic, and demographic patterns.</li>
          </ul>
        </>
      )
    },
    {
      id: "cookies",
      title: "Cookies & Tracking Technologies",
      icon: <Eye className="w-6 h-6 text-amber-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      )
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>
      )
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-6 h-6 text-rose-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, including modern encryption and secure server architectures, we cannot guarantee its absolute security.
        </p>
      )
    },
    {
      id: "user-rights",
      title: "Your Data Rights",
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          You have the right to access, update or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
        </p>
      )
    },
    {
      id: "changes",
      title: "Changes To This Policy",
      icon: <FileText className="w-6 h-6 text-sky-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500">
      <Helmet>
        <title>Privacy Policy - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Learn how we collect, use, and protect your data." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl relative">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-x-1 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gradient-to-br from-primary to-accent rounded-[2rem] p-10 md:p-16 text-center text-white shadow-2xl mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              We are committed to protecting your privacy and ensuring your data is secure. 
            </p>
            <p className="text-white/60 text-sm mt-6">Last Updated: June 15, {new Date().getFullYear()}</p>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-inner">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{section.title}</h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Have questions about your privacy?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Our data protection team is here to help you understand your rights.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-1">
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
