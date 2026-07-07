import React, { useState, useEffect } from 'react';
import { Shield, Download, Star, Check, Zap, ArrowRight, X } from 'lucide-react';
import { useGetPremiumPlansQuery, useSubmitPremiumRequestMutation } from '../features/api/paymentApiSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import QRPaymentModal from '../components/QRPaymentModal';
import SEO from '../components/SEO';

const Premium = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const { data: plansRes, isLoading } = useGetPremiumPlansQuery();
  const [submitPremiumRequest, { isLoading: isSubmitting }] = useSubmitPremiumRequestMutation();

  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = plansRes?.data || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePaymentSubmit = async ({ transactionId, proofImage }) => {
    if (!user) {
      return navigate('/login?redirect=/premium');
    }

    try {
      const formData = new FormData();
      formData.append('image', proofImage);
      
      const uploadRes = await fetch('/api/upload/proof', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        throw new Error('Image upload failed');
      }

      await submitPremiumRequest({
        planId: selectedPlan._id,
        transactionId,
        amount: selectedPlan.price,
        proofImage: uploadData.url
      }).unwrap();
      
      toast.success('Payment submitted successfully! Waiting for admin approval.');
      setSelectedPlan(null);
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Payment submission failed.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20 overflow-hidden relative">
      <SEO title="Premium - Elevate Your Experience" />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-4 pt-24 pb-16 text-center max-w-5xl relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">One Subscription for Apps & Movies</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
          Elevate Your <br className="md:hidden" />
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">Experience</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto font-light">
          Get exclusive access to premium mods and unlimited 4K movie streaming. Remove all advertisements and enjoy lightning-fast servers.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm md:text-base font-semibold">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-emerald-500" /></div>
            Active Users: 10K+
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-blue-500" /></div>
            Apps Unlocked: 5,000+
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-amber-500" /></div>
            Ad-Free: 100%
          </motion.div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 mb-24 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Go Premium?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Unlock the ultimate potential of your device with our carefully curated premium benefits.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: "Zero Advertisements", desc: "Enjoy a completely clean, uninterrupted experience without any annoying popups, banners, or video ads.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
            { icon: Download, title: "Lightning Fast Downloads", desc: "Bypass standard download limits. Connect to our exclusive premium servers for maximum speed.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
            { icon: Star, title: "Exclusive Premium Apps", desc: "Get access to our vault of highly requested pro apps and exclusive mods not available to regular users.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
            { icon: Zap, title: "Early Access Updates", desc: "Be the first to download the latest versions and updates 48 hours before they are released to the public.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
            { icon: Check, title: "Priority VIP Support", desc: "Get your questions answered immediately. Request new apps and get them uploaded with highest priority.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
            { icon: Shield, title: "Premium Profile Badge", desc: "Stand out in the community with an exclusive animated Premium Badge on your profile and comments.", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`bg-[#0F0F0F] border border-white/5 rounded-3xl p-8 transition-all duration-300 relative overflow-hidden group shadow-xl ${item.border}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-full blur-[50px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3 relative z-10">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Choose Your Plan</h2>
          <p className="text-slate-400 text-lg">One subscription unlocks EVERYTHING. Movies, Shows, Apps & Games.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div></div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
          >
            {plans.map((plan, idx) => {
              const isPopular = idx === 1;
              return (
                <motion.div 
                  key={plan._id} 
                  variants={itemVariants}
                  whileHover={{ y: -15 }}
                  className={`relative bg-[#0F0F0F] rounded-3xl p-1 flex flex-col transition-all duration-300 ${isPopular ? 'scale-105 md:scale-110 z-20 shadow-[0_0_50px_rgba(168,85,247,0.2)]' : 'border border-white/10 hover:border-purple-500/50'}`}
                >
                  {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500 to-orange-500 rounded-3xl -z-10 blur-sm opacity-50"></div>
                  )}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-20 shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="bg-[#0F0F0F] rounded-[23px] p-8 flex-1 flex flex-col relative z-10 h-full">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-6">
                      <p className="text-5xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        {plan.currency === 'INR' ? '₹' : '$'}{plan.price}
                      </p>
                    </div>
                    
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

                    <ul className="flex-1 space-y-5 mb-10">
                      {(plan.benefits || plan.features || []).map((benefit, i) => (
                        <li key={i} className="flex items-start text-slate-300 group">
                          <div className="mt-0.5 mr-4 p-1 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isPopular ? 'bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                    >
                      Get Started <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <QRPaymentModal 
            isOpen={!!selectedPlan} 
            onClose={() => setSelectedPlan(null)} 
            amount={selectedPlan?.price} 
            itemName={selectedPlan?.name} 
            onSubmit={handlePaymentSubmit} 
            isSubmitting={isSubmitting} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Premium;
