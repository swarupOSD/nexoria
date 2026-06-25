import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetSettingsQuery } from '../../features/settings/settingsApiSlice';
import { Scale, CheckCircle, AlertTriangle, CreditCard, UserCheck, ShieldOff, ShieldAlert, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsOfService = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          By accessing or using {settings.siteName || 'our platform'}, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
        </p>
      )
    },
    {
      id: "responsibilities",
      title: "2. User Responsibilities",
      icon: <UserCheck className="w-6 h-6 text-blue-500" />,
      content: (
        <>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            As a user of our platform, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 marker:text-primary">
            <li>Provide accurate and complete information when creating an account.</li>
            <li>Maintain the security of your password and account credentials.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
            <li>Not use the service for any illegal or unauthorized purpose.</li>
          </ul>
        </>
      )
    },
    {
      id: "premium",
      title: "3. Premium Membership Terms",
      icon: <CreditCard className="w-6 h-6 text-amber-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          Premium subscriptions are billed on a recurring basis as explicitly stated at checkout. By purchasing a Premium Membership, you authorize us to charge your selected payment method. You may cancel your subscription at any time, but no refunds will be provided for partially unused billing periods unless required by law.
        </p>
      )
    },
    {
      id: "prohibited",
      title: "4. Prohibited Activities",
      icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
      content: (
        <>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            You are strictly prohibited from engaging in the following activities:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 marker:text-primary">
            <li>Distributing viruses, malware, or any other harmful computer code.</li>
            <li>Attempting to bypass our security measures or paywalls.</li>
            <li>Scraping, crawling, or extracting data automatically without permission.</li>
            <li>Selling or transferring your premium account to another individual.</li>
          </ul>
        </>
      )
    },
    {
      id: "limitation",
      title: "5. Limitation of Liability",
      icon: <ShieldOff className="w-6 h-6 text-slate-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          In no event shall {settings.siteName || 'our platform'} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we have been notified orally or in writing of the possibility of such damage.
        </p>
      )
    },
    {
      id: "termination",
      title: "6. Termination",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      content: (
        <p className="text-slate-600 dark:text-slate-400">
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500">
      <Helmet>
        <title>Terms of Service - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Read our Terms of Service." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-4xl relative">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-x-1 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-10 md:p-16 text-center text-white shadow-2xl mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <Scale className="w-16 h-16 mx-auto mb-6 opacity-90 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-slate-400 text-sm mt-6">Effective Date: January 1, {new Date().getFullYear()}</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl shadow-inner">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed pl-14">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
