import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Save, Check, X , LayoutTemplate } from 'lucide-react';
import BackButton from '../../components/BackButton';

const RolesPermissions = () => {
  const permissionsList = [
    'View Dashboard', 'Manage Posts', 'Manage Categories', 
    'Moderate Comments', 'Moderate Ratings', 'View Analytics', 
    'Manage Users', 'Manage Admins', 'Site Settings', 'Manage Ads', 
    'Database Backup/Restore', 'View Security Logs'
  ];

  const roles = ['User', 'Admin', 'Super Admin'];

  // Dummy State for Permissions
  const [permissionsMap, setPermissionsMap] = useState({
    'User': {},
    'Admin': {
      'View Dashboard': true, 'Manage Posts': true, 'Manage Categories': true, 
      'Moderate Comments': true, 'Moderate Ratings': true, 'View Analytics': true
    },
    'Super Admin': permissionsList.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})
  });

  const togglePermission = (role, permission) => {
    if (role === 'Super Admin') return; // Cannot toggle super admin
    
    setPermissionsMap(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Roles & Permissions - Super Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackRoute="/superadmin" showText={false} />
          <div>
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-primary" />
              Roles & Permissions
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure global access controls across the platform.</p>
          </div>
        </div>
      </div>
        <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-lg hover:shadow-red-500/30 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all w-max">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-4 font-bold text-slate-700 dark:text-slate-200 uppercase text-xs w-1/4">Permissions</th>
                {roles.map(role => (
                  <th key={role} className="p-4 font-bold text-center uppercase text-xs dark:text-slate-200">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {permissionsList.map((permission) => (
                <tr key={permission} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-medium dark:text-slate-300 text-sm">{permission}</td>
                  {roles.map(role => {
                    const isGranted = permissionsMap[role][permission];
                    const isSuperAdmin = role === 'Super Admin';
                    
                    return (
                      <td key={`${role}-${permission}`} className="p-4 text-center">
                        <button 
                          onClick={() => togglePermission(role, permission)}
                          disabled={isSuperAdmin}
                          className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                            isSuperAdmin ? 'bg-red-100 text-red-500 dark:bg-red-900/30 cursor-not-allowed opacity-50' :
                            isGranted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 hover:bg-green-200' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {isGranted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default RolesPermissions;
