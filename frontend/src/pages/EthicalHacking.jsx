import React, { useState } from 'react';
import AgeVerificationModal from '../components/AgeVerificationModal';
import { Terminal, Code, Server, ShieldCheck, Loader2 } from 'lucide-react';
import { useGetHackingToolsQuery } from '../features/hacking/hackingApiSlice';

const iconMap = {
  TerminalIcon: Terminal,
  ServerIcon: Server,
  CodeBracketIcon: Code,
  ShieldCheckIcon: ShieldCheck,
};

const EthicalHacking = () => {
  const [isVerified, setIsVerified] = useState(false);
  const { data: toolsData, isLoading } = useGetHackingToolsQuery();
  const features = toolsData?.data || [];

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-['Fira_Sans'] selection:bg-emerald-500/30 pb-20">
      <AgeVerificationModal onVerified={() => setIsVerified(true)} />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCAwTDQgMEw0IDFMMSAxWiIgZmlsbD0iIzIyMiIvPgo8L3N2Zz4=')]"></div>
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 transition-opacity duration-1000 ${isVerified ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-xs font-['Fira_Code'] tracking-wider">SYSTEM SECURE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight font-['Fira_Code']">
            Ethical <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Hacking</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed font-['Fira_Sans']">
            Welcome to the terminal. Explore advanced cybersecurity concepts, master penetration testing, and learn how to defend critical infrastructure.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Main Feature Card - Spans 2 columns */}
          {!isLoading && features.length > 0 && (() => {
            const feature = features[0];
            const IconComponent = iconMap[feature.icon] || Terminal;
            return (
              <div className={`lg:col-span-2 group relative overflow-hidden rounded-3xl bg-[#0F172A] border border-white/5 hover:${feature.border} transition-colors duration-500 p-8 shadow-2xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 bg-[#020617] rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:${feature.border} transition-colors duration-300`}>
                      <IconComponent className={`w-6 h-6 ${feature.color.includes('emerald') ? 'text-emerald-400' : feature.color.includes('purple') ? 'text-purple-400' : feature.color.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
                    </div>
                    <h3 className="text-3xl font-['Fira_Code'] font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 max-w-md font-['Fira_Sans'] text-lg">
                      {feature.description}
                    </p>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => feature.actionUrl && window.open(feature.actionUrl, '_blank')}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-['Fira_Code'] font-bold rounded-xl transition-colors duration-200 text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95"
                >
                  INITIALIZE_ENVIRONMENT
                </button>
              </div>
            </div>

            {/* Decorative Terminal Code Background */}
            <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl opacity-50 rounded-full"></div>
            <div className="absolute right-0 bottom-0 p-8 opacity-20 pointer-events-none font-mono text-xs text-emerald-500">
              <p>root@nexoria:~# ./scan -A 10.0.0.1</p>
              <p>Starting Nmap 7.92</p>
              <p>Host is up (0.0012s latency).</p>
              <p>Not shown: 998 closed ports</p>
              <p>PORT   STATE SERVICE</p>
              <p>22/tcp open  ssh</p>
              <p>80/tcp open  http</p>
            </div>
            </div>
            );
          })()}

          {/* Secondary Cards */}
          {isLoading && <div className="col-span-full text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>}
          {!isLoading && features.slice(1).map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Terminal;
            return (
            <div 
              key={index}
              onClick={() => feature.actionUrl && window.open(feature.actionUrl, '_blank')}
              className={`group relative overflow-hidden rounded-3xl bg-[#0F172A] border border-white/5 hover:${feature.border} transition-all duration-500 p-8 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className={`w-12 h-12 bg-[#020617] rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:${feature.border} transition-colors duration-300`}>
                  <IconComponent className={`w-6 h-6 ${feature.color.includes('emerald') ? 'text-emerald-400' : feature.color.includes('purple') ? 'text-purple-400' : feature.color.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
                </div>
                <h3 className="text-xl font-['Fira_Code'] font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-['Fira_Sans'] mb-6 flex-1">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 mt-auto text-xs font-['Fira_Code'] font-bold text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Launch_Target</span>
                  <Terminal className="w-3 h-3" />
                </div>
              </div>
            </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default EthicalHacking;
