import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useGetSettingsQuery } from '../../features/settings/settingsApiSlice';
import { AlertTriangle, Mail, Scale, FileSignature, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const DmcaDisclaimer = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500">
      <Helmet>
        <title>DMCA Disclaimer - {settings.siteName || 'Premium Apps'}</title>
        <meta name="description" content="Read our DMCA Policy and Copyright Notice." />
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
          className="bg-gradient-to-br from-red-500 to-rose-700 rounded-[2rem] p-10 md:p-16 text-center text-white shadow-2xl mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6 opacity-90 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">DMCA Disclaimer</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              We respect the intellectual property rights of others.
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Copyright Notice</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              All files and software found on {settings.siteName || 'our platform'} are strictly for promotional and testing purposes. We do not host any copyrighted files on our servers. All files are collected from various sources on the internet and believed to be in the "public domain".
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-4">
              If you are the rightful owner of any contents posted here, and object to them being displayed or if you are one of representatives of copy rights department and you don't like our conditions of store, please contact us immediately.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileSignature className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">DMCA Takedown Procedure</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4">
              To submit a copyright infringement notification to us, you must send a written communication that includes substantially the following:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 marker:text-primary">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed.</li>
              <li>Information reasonably sufficient to permit the service provider to contact the complaining party, such as an address, telephone number, and email address.</li>
              <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 md:p-8 border border-amber-200 dark:border-amber-700/50 text-center"
          >
            <Mail className="w-10 h-10 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submit a Notice</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">
              Please allow 1-3 business days for an email response. Note that emailing your complaint to other parties such as our Internet Service Provider will not expedite your request.
            </p>
            <a 
              href={`mailto:${settings.legalEmail || settings.contactEmail || 'legal@example.com'}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-1"
            >
              Email Legal Department <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default DmcaDisclaimer;
