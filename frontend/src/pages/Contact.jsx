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
    <div className="font-jakarta min-h-screen bg-[#030303] pt-24 pb-20 transition-colors duration-500 relative overflow-hidden text-white selection:bg-blue-500/30">
      <SEO 
        title={`Contact Us - ${settings.siteName || 'Premium Apps'}`}
        description="Get in touch with our team for support, business inquiries, or legal matters."
      />

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner backdrop-blur-md">
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Get in <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about premium features, need technical support, or want to partner with us, our team is ready to help.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Contact Information Sidebar */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 lg:col-span-1">
            <HeroDisplay position="Sidebar" />
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner">
                  {method.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">{method.title}</h3>
                <p className="text-white/50 text-[15px] font-medium mb-4 leading-relaxed">{method.description}</p>
                <a href={`mailto:${method.email}`} className="text-blue-400 font-bold text-sm flex items-center gap-2 hover:text-blue-300 transition-colors">
                  {method.email}
                </a>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Send us a Message</h2>
              
              {status && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 mb-8 rounded-2xl flex items-start gap-3 font-medium backdrop-blur-md ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  {status.message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <input 
                      id="name" type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
                      placeholder="Your Name"
                    />
                    <label 
                      htmlFor="name"
                      className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
                    >
                      Your Name
                    </label>
                  </div>
                  <div className="relative group">
                    <input 
                      id="email" type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
                      placeholder="Email Address"
                    />
                    <label 
                      htmlFor="email"
                      className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
                    >
                      Email Address
                    </label>
                  </div>
                </div>
                <div className="relative group">
                  <input 
                    id="subject" type="text" name="subject" value={formData.subject} onChange={handleChange} required
                    className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm"
                    placeholder="Subject"
                  />
                  <label 
                    htmlFor="subject"
                    className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[16px] peer-focus:top-[6px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[6px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
                  >
                    Subject
                  </label>
                </div>
                <div className="relative group mt-6">
                  <textarea 
                    id="message" name="message" value={formData.message} onChange={handleChange} required rows="6"
                    className="peer w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-6 pb-4 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm resize-none"
                    placeholder="Message"
                  />
                  <label 
                    htmlFor="message"
                    className="absolute left-4 top-[18px] text-white/40 text-base transition-all pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:top-[20px] peer-focus:top-[8px] peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:top-[8px] peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:font-bold uppercase tracking-wider"
                  >
                    Message
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="group relative w-full h-14 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  <div className="relative z-10 flex items-center justify-center gap-2 text-lg">
                    {isLoading ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Sending...</>
                    ) : (
                      <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Send Message</>
                    )}
                  </div>
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
