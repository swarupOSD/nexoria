import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetMyContactMessagesQuery, useCreateContactMessageMutation, useReplyContactMessageMutation } from '../features/contact/contactApiSlice';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import SEO from '../components/SEO';

const Support = () => {
  const { user } = useSelector(state => state.auth);
  
  const { data: ticketsRes, isLoading, refetch } = useGetMyContactMessagesQuery(undefined, {
    skip: !user
  });
  
  const [createMessage, { isLoading: isCreating }] = useCreateContactMessageMutation();
  const [replyMessage, { isLoading: isReplying }] = useReplyContactMessageMutation();
  
  const tickets = ticketsRes?.data || [];
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Support');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Socket listener for real-time ticket updates
  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      
      socket.emit('setup', user);
      
      socket.on('ticket updated', (ticket) => {
        refetch();
      });
      
      socket.on('ticket replied', (ticket) => {
        refetch();
        if (selectedTicket && selectedTicket._id === ticket._id) {
          setSelectedTicket(ticket);
        }
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [user, selectedTicket, refetch]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) return toast.error('Subject and message are required');
    
    try {
      await createMessage({
        subject,
        message,
        category,
        name: user?.name || 'Guest',
        email: user?.email || 'guest@example.com'
      }).unwrap();
      
      toast.success('Ticket created successfully');
      setSubject('');
      setMessage('');
      setCategory('Support');
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    
    try {
      await replyMessage({
        id: selectedTicket._id,
        data: { message: replyText }
      }).unwrap();
      
      setReplyText('');
      toast.success('Reply sent');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  if (!user) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center text-white pb-20">
        <div className="text-center bg-[#111] border border-white/5 p-12 rounded-2xl max-w-md">
          <h2 className="text-2xl font-bold mb-4">Support Center</h2>
          <p className="text-slate-400">Please login to access the Support Center and manage your tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-jakarta bg-[#030303] min-h-screen text-white pb-20 relative overflow-hidden selection:bg-blue-500/30">
      <SEO title="Support Center - PremiumApps" />
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px]"></div>
        
        {/* Animated Rings for visual interest */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square flex items-center justify-center opacity-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[100%] h-[100%] rounded-full border border-white/[0.03]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[80%] h-[80%] rounded-full border border-white/[0.05]" />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl border-b border-white/10 pt-20 pb-16 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Support Center</h1>
          <p className="text-white/60 text-lg font-medium">We are here to help you. Open a ticket or reply to an existing one.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Side: Create Ticket */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 sticky top-24 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4">Create Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              
              <div className="relative group">
                <select 
                  id="category" value={category} onChange={e => setCategory(e.target.value)}
                  className="peer w-full h-14 bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-4 pb-1 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm appearance-none"
                >
                  <option className="bg-[#111]" value="Support">General Support</option>
                  <option className="bg-[#111]" value="Purchase Problem">Billing &amp; Premium</option>
                  <option className="bg-[#111]" value="Technical Issue">Technical Issue</option>
                  <option className="bg-[#111]" value="Bug Report">Report a Bug</option>
                  <option className="bg-[#111]" value="Premium Membership">Premium Membership</option>
                  <option className="bg-[#111]" value="Feature Request">Feature Request</option>
                  <option className="bg-[#111]" value="Other">Other</option>
                </select>
                <label 
                  htmlFor="category"
                  className="absolute left-4 top-[6px] text-blue-400 text-[11px] font-bold uppercase tracking-wider"
                >
                  Category
                </label>
              </div>
              
              <div className="relative group">
                <input 
                  id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} required
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
              
              <div className="relative group">
                <textarea 
                  id="message" value={message} onChange={e => setMessage(e.target.value)} required
                  className="peer w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl px-4 pt-6 pb-4 text-white placeholder-transparent focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-base shadow-inner backdrop-blur-sm h-40 resize-none"
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
                disabled={isCreating}
                className="group relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                <div className="relative z-10 flex items-center justify-center gap-2 text-lg">
                  {isCreating ? 'Submitting...' : 'Submit Ticket'}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: My Tickets */}
        <div className="w-full lg:w-2/3">
          {selectedTicket ? (
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex flex-col h-[700px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="font-black text-2xl text-white tracking-tight">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-white/50 font-medium">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTicket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : selectedTicket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {selectedTicket.status}
                    </span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-white/60 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 backdrop-blur-md">
                  Back
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                <div className="flex flex-col items-end">
                  <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] backdrop-blur-md">
                    <p className="text-xs font-black mb-2 text-blue-400 uppercase tracking-wider">You</p>
                    <p className="whitespace-pre-wrap font-medium">{selectedTicket.message}</p>
                  </div>
                </div>
                
                {selectedTicket.replies?.map((reply, idx) => (
                  <div key={idx} className={`flex flex-col ${reply.isAdmin ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] backdrop-blur-md ${reply.isAdmin ? 'bg-white/10 border border-white/10 text-white rounded-tl-sm' : 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-white rounded-tr-sm'}`}>
                      <p className={`text-xs font-black mb-2 uppercase tracking-wider ${reply.isAdmin ? 'text-purple-400' : 'text-blue-400'}`}>{reply.isAdmin ? 'Support Team' : 'You'}</p>
                      <p className="whitespace-pre-wrap font-medium">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedTicket.status !== 'Resolved' && (
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <form onSubmit={handleReply} className="flex gap-3 relative">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="flex-1 h-14 bg-black/40 border border-white/10 rounded-2xl px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner backdrop-blur-sm font-medium"
                    />
                    <button type="submit" disabled={isReplying} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 h-14 rounded-2xl font-black hover:from-blue-500 hover:to-indigo-500 transition shadow-[0_5px_15px_rgba(59,130,246,0.3)] disabled:opacity-50">
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="p-8 border-b border-white/10 bg-white/5">
                <h2 className="text-2xl font-black text-white tracking-tight">My Tickets</h2>
              </div>
              
              {isLoading ? (
                <div className="p-12 text-center flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-white/50 font-medium">You haven't opened any tickets yet.</div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {tickets.map(ticket => (
                    <li 
                      key={ticket._id} 
                      className="p-6 hover:bg-white/10 cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors group"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{ticket.subject}</h4>
                        <p className="text-sm text-white/50 font-medium mt-1">{new Date(ticket.createdAt).toLocaleDateString()} &middot; {ticket.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : ticket.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Support;
