import React, { useState, useEffect } from 'react';
import { useCreateContactMessageMutation } from '../features/contact/contactApiSlice';
import { useGetSettingsQuery } from '../features/settings/settingsApiSlice';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare, Briefcase, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import HeroDisplay from '../components/HeroDisplay';

const Contact = () => {
  const { data: settingsRes } = useGetSettingsQuery();
  const settings = settingsRes?.data || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);

  const [createContactMessage, { isLoading }] = useCreateContactMessageMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContactMessage(formData).unwrap();
      setStatus({ type: 'success', message: 'Message sent successfully. We will get back to you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setStatus({ type: 'error', message: err?.data?.message || 'Server error' });
    }
  };

  const contactMethods = [
    {
      title: 'General Support',
      description: 'Questions about your account or app downloads.',
      email: settings.supportEmail || settings.contactEmail || 'support@example.com',
      icon: <HelpCircle className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Business Inquiries',
      description: 'Partnerships, advertising, and corporate relations.',
      email: settings.businessEmail || settings.contactEmail || 'business@example.com',
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />
    },
    {
      title: 'Legal & DMCA',
      description: 'Copyright claims and legal communication.',
      email: settings.legalEmail || settings.contactEmail || 'legal@example.com',
      icon: <AlertCircle className="w-6 h-6 text-rose-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 pb-20 transition-colors duration-500 relative overflow-hidden">
      <SEO 
        title={`Contact Us - ${settings.siteName || 'Premium Apps'}`}
        description="Get in touch with our team for support, business inquiries, or legal matters."
      />

      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Whether you have a question about premium features, need technical support, or want to partner with us, our team is ready to help.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Contact Information Sidebar */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 lg:col-span-1">
            <HeroDisplay position="Sidebar" />
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{method.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">{method.description}</p>
                <a href={`mailto:${method.email}`} className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                  {method.email}
                </a>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-slate-700/50 shadow-xl relative overflow-hidden">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
              
              {status && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-4 mb-6 rounded-xl flex items-start gap-3 font-medium ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  {status.message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Your Name</label>
                    <input 
                      id="name"
                      type="text" 
                      name="name"
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email"
                      value={formData.email} 
                      onChange={handleChange} 
                      required
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Subject</label>
                  <input 
                    id="subject"
                    type="text" 
                    name="subject"
                    value={formData.subject} 
                    onChange={handleChange} 
                    required
                    placeholder="How can we help?"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Message</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message} 
                    onChange={handleChange} 
                    required
                    rows="6"
                    placeholder="Describe your issue or inquiry in detail..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <><Send className="w-5 h-5" /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
