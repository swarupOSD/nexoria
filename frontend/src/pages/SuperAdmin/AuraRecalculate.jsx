import React, { useState } from 'react';
import { Trophy, RefreshCcw, AlertTriangle, CheckCircle, Flame , LayoutTemplate } from 'lucide-react';
import { useRecalculateAuraMutation } from '../../features/api/auraApiSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';

const AuraRecalculate = () => {
  const [recalculateAura, { isLoading }] = useRecalculateAuraMutation();
  const [resultMessage, setResultMessage] = useState('');

  const handleRecalculate = async () => {
    if (window.confirm("Are you sure you want to recalculate all Aura scores? This will override current scores for all posts and users based on their latest activity data.")) {
      try {
        const res = await recalculateAura().unwrap();
        toast.success('Aura Scores Recalculated!');
        setResultMessage(res.message || 'Successfully recalculated all aura scores and user ranks.');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to recalculate Aura');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-purple-500" />
          Aura System Recalculation
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Force a manual recalculation of Aura Scores for all items and users in the database.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Warning: Resource Intensive Operation</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
              Recalculating the Aura Score will iterate through all published posts and registered users in the database. 
              The score will be updated based on the live dynamic formula: <br/><br/>
              <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-purple-600 dark:text-purple-400 font-mono text-xs">
                (Likes * 5) + (Downloads * 3) + (Comments * 2) + Views + Battle Wins
              </code>
              <br/><br/>
              User Ranks will also be updated based on their total Aura Votes history.
            </p>
            <p className="text-sm font-semibold text-rose-500">
              Note: Do not run this frequently on large databases as it may cause temporary latency.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRecalculate}
            disabled={isLoading}
            className={`relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all duration-300 ${
              isLoading 
                ? 'bg-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-6 h-6 animate-spin" />
                Recalculating Database...
              </>
            ) : (
              <>
                <Flame className="w-6 h-6 group-hover:animate-bounce" />
                Recalculate Aura Now
                <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </>
            )}
          </motion.button>
        </div>

        {resultMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium text-sm">{resultMessage}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuraRecalculate;
