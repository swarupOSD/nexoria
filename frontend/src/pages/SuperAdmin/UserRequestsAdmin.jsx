import React, { useState } from 'react';
import { useGetRequestsQuery, useUpdateRequestStatusMutation, useDeleteRequestMutation } from '../../features/api/requestApiSlice';
import { Trash2, Loader2, Search , LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const UserRequestsAdmin = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { data, isLoading, refetch } = useGetRequestsQuery({
    page,
    limit: 15,
    status: statusFilter !== 'All' ? statusFilter : undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateRequestStatusMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteRequestMutation();

  const handleStatusChange = async (id, status, response = '') => {
    try {
      await updateStatus({ id, status, adminResponse: response }).unwrap();
      toast.success(`Request marked as ${status}`);
      setSelectedRequest(null);
      setAdminResponse('');
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequest(id).unwrap();
        toast.success('Request deleted');
        refetch();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Requests</h1>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">User</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Request</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Upvotes</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin inline text-2xl text-indigo-500"/></td></tr>
            ) : data?.data?.map((req) => (
              <React.Fragment key={req._id}>
                <tr className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={req.user?.profileImage || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{req.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold">{req.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs">{req.type}</span></td>
                  <td className="p-4 font-bold text-indigo-500">{req.upvotes}</td>
                  <td className="p-4">
                    <select 
                      value={req.status}
                      onChange={(e) => {
                        if (e.target.value === 'Completed' || e.target.value === 'Rejected') {
                          setSelectedRequest(req);
                        } else {
                          handleStatusChange(req._id, e.target.value);
                        }
                      }}
                      className="bg-transparent border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(req._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>

                {selectedRequest?._id === req._id && (
                  <tr>
                    <td colSpan="6" className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold mb-1">Admin Response (Sent to user)</label>
                          <input 
                            type="text" 
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-3 py-2"
                            placeholder="e.g. Added to the database! Here is the link..."
                          />
                        </div>
                        <button 
                          onClick={() => handleStatusChange(req._id, document.querySelector(`select[value="${req.status}"]`).value || 'Completed', adminResponse)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                        >
                          Confirm & Save
                        </button>
                        <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded">Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRequestsAdmin;
