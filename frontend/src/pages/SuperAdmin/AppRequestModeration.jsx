import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ArrowRightCircle, Inbox, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AppRequestModeration = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState({});

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/app-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const payload = { status };
      if (editingNotes[id] !== undefined) {
        payload.adminNotes = editingNotes[id];
      }

      const res = await fetch(`/api/app-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Request marked as ${status}`);
        setRequests(requests.map(r => r._id === id ? data.data : r));
      }
    } catch (err) {
      toast.error('Error updating request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-sky-500" /> App Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage user requests for new apps or mod updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium w-1/6">App Details</th>
                  <th className="p-4 font-medium w-1/6">User</th>
                  <th className="p-4 font-medium w-1/4">Description</th>
                  <th className="p-4 font-medium w-1/6">Admin Notes</th>
                  <th className="p-4 font-medium w-[10%]">Status</th>
                  <th className="p-4 font-medium text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No app requests found.
                    </td>
                  </tr>
                ) : requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] group">
                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-900 dark:text-white text-base">{req.appName}</div>
                      <div className="text-xs text-sky-500 font-medium uppercase tracking-wider mt-1">{req.category}</div>
                      {req.priority === 'High' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] rounded-full font-bold">
                          HIGH PRIORITY
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900 dark:text-white">{req.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{req.user?.email}</div>
                    </td>
                    <td className="p-4 align-top text-slate-600 dark:text-slate-400">
                      <p className="line-clamp-3 text-sm">{req.description || '-'}</p>
                    </td>
                    <td className="p-4 align-top">
                      <textarea
                        className="w-full h-20 text-xs p-2 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
                        placeholder="Add notes..."
                        value={editingNotes[req._id] !== undefined ? editingNotes[req._id] : (req.adminNotes || '')}
                        onChange={(e) => setEditingNotes({ ...editingNotes, [req._id]: e.target.value })}
                        onBlur={() => {
                           if (editingNotes[req._id] !== undefined && editingNotes[req._id] !== req.adminNotes) {
                             handleUpdate(req._id, req.status);
                           }
                        }}
                      />
                    </td>
                    <td className="p-4 align-top">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right space-y-2">
                      <div className="flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdate(req._id, 'In Progress')} className="text-xs flex items-center justify-end w-full gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded">
                          <Clock className="w-3 h-3" /> Mark In Progress
                        </button>
                        <button onClick={() => handleUpdate(req._id, 'Completed')} className="text-xs flex items-center justify-end w-full gap-1 px-2 py-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 rounded">
                          <CheckCircle className="w-3 h-3" /> Mark Completed
                        </button>
                        <button onClick={() => handleUpdate(req._id, 'Rejected')} className="text-xs flex items-center justify-end w-full gap-1 px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded">
                          <XCircle className="w-3 h-3" /> Mark Rejected
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppRequestModeration;
