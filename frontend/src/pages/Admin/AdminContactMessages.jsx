import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Trash2, Mail, XCircle } from 'lucide-react';
import { 
  useGetContactMessagesQuery, 
  useResolveContactMessageMutation, 
  useDeleteContactMessageMutation 
} from '../../features/contact/contactApiSlice';

const AdminContactMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: messagesRes, isLoading } = useGetContactMessagesQuery(searchTerm);
  const [resolveMessage] = useResolveContactMessageMutation();
  const [deleteMessage] = useDeleteContactMessageMutation();

  const messages = messagesRes?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleResolve = async (id) => {
    if (window.confirm('Mark this message as resolved?')) {
      try {
        await resolveMessage(id).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || 'Error resolving message');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id).unwrap();
      } catch (err) {
        toast.error(err?.data?.message || 'Error deleting message');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Contact Messages - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Contact Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Manage inquiries from users and visitors.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email or subject..." 
            className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
        </form>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Subject & Message</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-slate-500">Loading messages...</td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-slate-500">No contact messages found.</td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg._id} className={`transition-colors ${msg.isResolved ? 'bg-slate-50/30 dark:bg-slate-800/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm dark:text-white">{msg.name}</p>
                          <p className="text-xs text-slate-500">{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{msg.subject}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{msg.message}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${msg.isResolved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {msg.isResolved ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!msg.isResolved && (
                          <button onClick={() => handleResolve(msg._id)} title="Mark as Resolved" className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(msg._id)} title="Delete Message" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminContactMessages;
