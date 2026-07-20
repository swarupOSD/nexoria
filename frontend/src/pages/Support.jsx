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
    <div className="bg-[#0A0A0A] min-h-screen text-white pb-20">
      <SEO title="Support Center - PremiumApps" />
      
      <div className="bg-[#111] border-b border-white/5 pt-10 pb-16 mb-10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-extrabold text-white mb-4">Support Center</h1>
          <p className="text-slate-400 text-lg">We are here to help you. Open a ticket or reply to an existing one.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Create Ticket */}
        <div className="w-full lg:w-1/3">
          <div className="bg-[#111] rounded-2xl border border-white/5 p-8 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                >
                  <option value="Support">General Support</option>
                  <option value="Purchase Problem">Billing &amp; Premium</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Bug Report">Report a Bug</option>
                  <option value="Premium Membership">Premium Membership</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-40 resize-none"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
              >
                {isCreating ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: My Tickets */}
        <div className="w-full lg:w-2/3">
          {selectedTicket ? (
            <div className="bg-[#111] rounded-2xl border border-white/5 flex flex-col h-[700px] overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="font-bold text-xl text-white">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${selectedTicket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : selectedTicket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {selectedTicket.status}
                    </span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  Back
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10">
                <div className="flex flex-col items-end">
                  <div className="bg-primary/20 border border-primary/30 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%]">
                    <p className="text-xs font-bold mb-2 text-primary">You</p>
                    <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>
                
                {selectedTicket.replies?.map((reply, idx) => (
                  <div key={idx} className={`flex flex-col ${reply.isAdmin ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] ${reply.isAdmin ? 'bg-white/10 border border-white/5 text-white rounded-tl-sm' : 'bg-primary/20 border border-primary/30 text-white rounded-tr-sm'}`}>
                      <p className={`text-xs font-bold mb-2 ${reply.isAdmin ? 'text-amber-500' : 'text-primary'}`}>{reply.isAdmin ? 'Support Team' : 'You'}</p>
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedTicket.status !== 'Resolved' && (
                <div className="p-4 border-t border-white/5 bg-[#111]">
                  <form onSubmit={handleReply} className="flex gap-3">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="flex-1 p-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button type="submit" disabled={isReplying} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition disabled:opacity-50">
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111] rounded-2xl border border-white/5">
              <div className="p-6 border-b border-white/5 bg-black/20">
                <h2 className="text-xl font-bold text-white">My Tickets</h2>
              </div>
              
              {isLoading ? (
                <div className="p-12 text-center text-slate-500 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center text-slate-500">You haven't opened any tickets yet.</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {tickets.map(ticket => (
                    <li 
                      key={ticket._id} 
                      className="p-6 hover:bg-white/5 cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors group"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        <p className="text-sm text-slate-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()} &middot; {ticket.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
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
