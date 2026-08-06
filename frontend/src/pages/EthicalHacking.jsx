import React, { useState, useEffect } from 'react';
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

  const [terminalLines, setTerminalLines] = useState([]);
  
  useEffect(() => {
    const lines = [
      "root@nexoria:~# ./scan -A 10.0.0.1",
      "Starting Nmap 7.92 ( https://nmap.org )",
      "Host is up (0.0012s latency).",
      "Not shown: 998 closed ports",
      "PORT   STATE SERVICE",
      "22/tcp open  ssh",
      "80/tcp open  http",
      "MAC Address: 00:00:00:00:00:00 (Xen)",
      "[+] Target acquired: 10.0.0.1",
      "[+] Initiating payload delivery...",
      "[+] Access granted. Welcome, Root.",
      "root@nexoria:~# _"
    ];
    const interval = setInterval(() => {
      setTerminalLines(prev => {
        if (prev.length >= lines.length) return [lines[0]];
        return [...prev, lines[prev.length]];
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-['Fira_Sans'] selection:bg-emerald-500/30 pb-20">
      <AgeVerificationModal onVerified={() => setIsVerified(true)} />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)]"></div>
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCAwTDQgMEw0IDFMMSAxWiIgZmlsbD0iIzIyMiIvPgo8L3N2Zz4=')] pointer-events-none"></div>
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
          
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight font-['Fira_Code'] uppercase relative">
            <span className="relative inline-block">
              Ethical 
              <span className="absolute inset-0 text-emerald-500/20 translate-x-1 translate-y-1 blur-sm -z-10">Ethical</span>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse ml-4">Hacking</span>
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
              <div className={`lg:col-span-2 group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-700 p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:shadow-emerald-500/10 hover:-translate-y-1`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-700`}></div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-14 h-14 bg-[#020617]/80 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:${feature.border} group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                      <IconComponent className={`w-7 h-7 ${feature.color.includes('emerald') ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : feature.color.includes('purple') ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : feature.color.includes('blue') ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-red-400'}`} />
                    </div>
                    <h3 className="text-3xl font-['Fira_Code'] font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400 max-w-md font-['Fira_Sans'] text-lg">
                      {feature.description}
                    </p>
              </div>
              
              <div className="mt-10">
                <button 
                  onClick={() => feature.actionUrl && window.open(feature.actionUrl, '_blank')}
                  className="group/btn relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-['Fira_Code'] font-bold rounded-xl transition-all duration-300 text-sm overflow-hidden active:scale-95 flex items-center gap-3"
                >
                  <span className="relative z-10">INITIALIZE_ENVIRONMENT</span>
                  <Terminal className="w-4 h-4 relative z-10 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Decorative Terminal Code Background */}
            <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl opacity-60 rounded-full"></div>
            <div className="absolute right-0 bottom-0 p-10 opacity-30 pointer-events-none font-mono text-[10px] sm:text-xs text-emerald-400 leading-relaxed max-w-sm overflow-hidden hidden sm:block">
              {terminalLines.map((line, i) => (
                <p key={i} className="whitespace-nowrap">{line}</p>
              ))}
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
              className={`group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 p-8 cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className={`w-12 h-12 bg-[#020617]/80 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:${feature.border} group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  <IconComponent className={`w-6 h-6 ${feature.color.includes('emerald') ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : feature.color.includes('purple') ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]' : feature.color.includes('blue') ? 'text-blue-400' : 'text-red-400'}`} />
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
