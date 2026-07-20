import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Users, Headphones, VideoOff, Crown, Lock, ShieldCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';
import PatternLock from '../components/PatternLock';

const VoiceLounge = () => {
  const { user } = useSelector(state => state.auth);
  const { requestPermission } = usePermissions();
  
  const [participants, setParticipants] = useState({}); // { [userId]: { ...info, stream, isSpeaking, isMuted } }
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [isLocked, setIsLocked] = useState(true);
  const [lockMode, setLockMode] = useState(localStorage.getItem('voiceLoungePattern') ? 'verify' : 'setup');
  const [setupPattern, setSetupPattern] = useState(null); // stores the first drawn pattern
  const [lockError, setLockError] = useState(false);
  const [lockSuccess, setLockSuccess] = useState(false);
  const [lockFeedback, setLockFeedback] = useState('');
  
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: RTCPeerConnection }
  const iceQueuesRef = useRef({}); // { [userId]: RTCIceCandidate[] }
  const audioRefs = useRef({}); // to attach streams to audio elements
  const audioContextRef = useRef(null);
  const analyserRefs = useRef({}); // for speech detection UI

  const flushIceQueue = (userId, peer) => {
    if (iceQueuesRef.current[userId]) {
      iceQueuesRef.current[userId].forEach(c => {
        peer.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      });
      iceQueuesRef.current[userId] = [];
    }
  };



  const roomId = 'secret-lounge';

  const setupSpeechDetection = (stream, userId) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const analyser = ctx.createAnalyser();
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyser.fftSize = 256;
    analyserRefs.current[userId] = analyser;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudioLevel = () => {
      if (!analyserRefs.current[userId]) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Update speaking state
      const isSpeaking = average > 10;
      setParticipants(prev => {
        if (!prev[userId] || prev[userId].isSpeaking === isSpeaking) return prev;
        return { ...prev, [userId]: { ...prev[userId], isSpeaking } };
      });
      
      requestAnimationFrame(checkAudioLevel);
    };
    checkAudioLevel();
  };

  const createPeerConnection = (targetUserId) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', { targetUserId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      
      // Update participant with stream
      setParticipants(prev => {
        if (!prev[targetUserId]) return prev;
        return {
          ...prev,
          [targetUserId]: {
            ...prev[targetUserId],
            stream: remoteStream
          }
        };
      });

      // Attach stream to dynamic audio element to avoid DOM mount race conditions
      if (!audioRefs.current[targetUserId]) {
        audioRefs.current[targetUserId] = new Audio();
        audioRefs.current[targetUserId].autoplay = true;
      }
      audioRefs.current[targetUserId].srcObject = remoteStream;
      audioRefs.current[targetUserId].play().catch(e => console.error("Audio play error:", e));
      
      setupSpeechDetection(remoteStream, targetUserId);
    };

    return peer;
  };

  useEffect(() => {
    if (!user) return;
    if (isLocked) return; // Wait until unlocked!

    // 1. Get Local Audio Stream
    const initLocalStream = async () => {
      try {
        const granted = await requestPermission('microphone');
        if (!granted) {
          toast.error("Microphone permission was denied.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        
        // Add ourselves to participants
        setParticipants(prev => ({
          ...prev,
          [user._id]: {
            ...user,
            isMuted: false,
            isSpeaking: false,
            isLocal: true
          }
        }));

        setupSpeechDetection(stream, user._id);
        connectToSocket();
      } catch (err) {
        console.error("Mic error:", err);
        toast.error("Microphone access is required for the Voice Lounge.");
      }
    };

    const connectToSocket = () => {
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('joinVoiceRoom', roomId);
      });

      socket.on('userJoinedVoice', async (remoteUser) => {
        // Create Peer connection and send offer
        toast.success(`${remoteUser.name} entered the lounge!`);
        
        const peer = createPeerConnection(remoteUser.userId);
        peersRef.current[remoteUser.userId] = peer;
        
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            peer.addTrack(track, localStreamRef.current);
          });
        }

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        
        socket.emit('webrtc-offer', { targetUserId: remoteUser.userId, sdp: offer });
        
        setParticipants(prev => ({
          ...prev,
          [remoteUser.userId]: { ...remoteUser, isMuted: false, isSpeaking: false, isLocal: false }
        }));
      });

      socket.on('webrtc-offer', async ({ senderId, sdp, senderInfo }) => {
        if (senderInfo) {
          setParticipants(prev => {
            if (!prev[senderId]) {
              return {
                ...prev,
                [senderId]: { ...senderInfo, userId: senderId, isMuted: false, isSpeaking: false, isLocal: false }
              };
            }
            return prev;
          });
        }

        const peer = createPeerConnection(senderId);
        peersRef.current[senderId] = peer;

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            peer.addTrack(track, localStreamRef.current);
          });
        }

        await peer.setRemoteDescription(new RTCSessionDescription(sdp));
        flushIceQueue(senderId, peer);
        
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('webrtc-answer', { targetUserId: senderId, sdp: answer });
      });

      socket.on('webrtc-answer', async ({ senderId, sdp, senderInfo }) => {
        if (senderInfo) {
          setParticipants(prev => {
            if (!prev[senderId]) {
              return {
                ...prev,
                [senderId]: { ...senderInfo, userId: senderId, isMuted: false, isSpeaking: false, isLocal: false }
              };
            }
            return prev;
          });
        }

        if (peersRef.current[senderId]) {
          await peersRef.current[senderId].setRemoteDescription(new RTCSessionDescription(sdp));
          flushIceQueue(senderId, peersRef.current[senderId]);
        }
      });

      socket.on('webrtc-ice-candidate', async ({ senderId, candidate }) => {
        const peer = peersRef.current[senderId];
        if (peer) {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          } else {
            if (!iceQueuesRef.current[senderId]) iceQueuesRef.current[senderId] = [];
            iceQueuesRef.current[senderId].push(candidate);
          }
        }
      });

      socket.on('userLeftVoice', ({ userId }) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
        setParticipants(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      });
    };

    initLocalStream();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveVoiceRoom', roomId);
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [user, isLocked]);

  // Redirect if not Premium (unless admin/owner)
  if (!user || (!user.isPremium && !['admin', 'superadmin', 'owner'].includes(user.role))) {
    return <Navigate to="/premium" replace />;
  }


  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setParticipants(prev => ({
          ...prev,
          [user._id]: { ...prev[user._id], isMuted: !audioTrack.enabled }
        }));
      }
    }
  };

  const handlePatternComplete = (pattern) => {
    if (pattern === 'TOO_SHORT' || pattern.length < 4) {
      setLockError(true);
      setLockFeedback('Pattern must connect at least 4 dots');
      setTimeout(() => setLockError(false), 1000);
      return;
    }

    if (lockMode === 'setup') {
      if (!setupPattern) {
        // Step 1 of Setup: Save the first pattern and ask to confirm
        setSetupPattern(pattern);
        setLockSuccess(true);
        setLockFeedback('Draw pattern again to confirm');
        setTimeout(() => setLockSuccess(false), 1000);
      } else {
        // Step 2 of Setup: Confirm pattern matches
        if (pattern === setupPattern) {
          localStorage.setItem('voiceLoungePattern', pattern);
          setLockSuccess(true);
          setLockFeedback('Pattern Saved!');
          setTimeout(() => {
            setIsLocked(false);
          }, 800);
        } else {
          setLockError(true);
          setLockFeedback('Patterns do not match. Try again.');
          setSetupPattern(null);
          setTimeout(() => setLockError(false), 1000);
        }
      }
    } else {
      const savedPattern = localStorage.getItem('voiceLoungePattern');
      if (savedPattern && pattern !== savedPattern) {
        setLockError(true);
        setLockFeedback('Incorrect pattern');
        setTimeout(() => setLockError(false), 1000);
      } else {
        setLockSuccess(true);
        setLockFeedback('Pattern Accepted!');
        setTimeout(() => {
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] pt-24 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      <AnimatePresence>
        {isLocked ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="w-full max-w-sm bg-[#1a1a1f]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col items-center">
              <div className="w-full p-6 border-b border-white/5 flex items-center justify-center bg-black/20">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  {lockMode === 'setup' ? <ShieldCheck className="w-6 h-6 text-purple-400" /> : <Lock className="w-6 h-6 text-purple-400" />}
                  {lockMode === 'setup' ? 'Setup Lounge Lock' : 'Unlock Lounge'}
                </h2>
              </div>

              <div className="p-6 w-full flex flex-col items-center">
                <p className="text-slate-300 text-sm text-center mb-8 px-2 font-medium">
                  {lockMode === 'setup' 
                    ? 'Draw a secret pattern to secure the Voice Lounge on this device.'
                    : 'Draw your secret pattern to enter the Voice Lounge.'
                  }
                </p>
                
                <div className="h-[280px] w-full flex items-center justify-center">
                  <PatternLock 
                    size={260} 
                    onComplete={handlePatternComplete} 
                    error={lockError}
                    success={lockSuccess}
                  />
                </div>

                <div className="mt-8 h-6 flex items-center justify-center w-full">
                  <AnimatePresence mode="wait">
                    {lockFeedback ? (
                      <motion.p
                        key={lockFeedback}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-sm font-bold ${lockError ? 'text-red-400' : lockSuccess ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {lockFeedback}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-slate-500 uppercase tracking-widest font-bold"
                      >
                        {lockMode === 'setup' 
                          ? (setupPattern ? 'Confirm your pattern' : 'Draw a secure pattern') 
                          : 'Draw your pattern'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className={`container mx-auto px-4 z-10 flex-1 flex flex-col items-center transition-all duration-700 ${isLocked ? 'blur-md opacity-30 pointer-events-none' : ''}`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 font-bold mb-4 tracking-wider uppercase text-sm">
            <Crown className="w-4 h-4" /> Premium Exclusive
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-sm">
            Voice Lounge
          </h1>
          <p className="text-slate-400 mt-3 font-medium flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isConnected ? 'Voice Chat Active' : 'Connecting to signaling server...'}
          </p>
        </div>

        {/* Avatar Grid */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
          {Object.values(participants).map((p) => (
            <div key={p._id || p.userId} className="flex flex-col items-center relative">
              
              {/* Pulsing ring for speaking */}
              {p.isSpeaking && !p.isMuted && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-purple-500 rounded-full z-0"
                  style={{ margin: '-10px' }}
                />
              )}

              <div className="relative z-10">
                <img 
                  src={p.profileImage?.startsWith('http') ? p.profileImage : `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${p.profileImage || 'default.jpg'}`}
                  alt={p.name}
                  className={`w-24 h-24 rounded-full object-cover border-4 transition-all duration-300 ${
                    p.isSpeaking && !p.isMuted ? 'border-purple-500 shadow-[0_0_20px_purple]' : 'border-slate-800'
                  } ${p.isMuted ? 'opacity-50 grayscale' : ''}`}
                />
                
                {/* Status Indicator Badge */}
                <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-[#0a0d14] flex items-center justify-center ${p.isMuted ? 'bg-red-500' : 'bg-slate-700'}`}>
                  {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              </div>

              <div className="mt-3 text-center">
                <h3 className="text-white font-bold text-sm truncate w-24">{p.name}</h3>
                <p className="text-slate-400 text-xs">@{p.username}</p>
                {p.isLocal && <span className="text-[10px] text-purple-400 font-bold bg-purple-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">YOU</span>}
              </div>

              {/* Hidden audio element to play remote stream */}
              {!p.isLocal && (
                <audio 
                  ref={el => audioRefs.current[p.userId || p._id] = el}
                  autoPlay 
                  className="hidden"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#0f1219]/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6">
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <div className="bg-slate-800 p-2 rounded-full">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold uppercase">{Object.keys(participants).length} Online</span>
          </div>

          <div className="w-px h-10 bg-white/10"></div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isMuted 
                ? 'bg-red-500/20 border border-red-500/50 text-red-500 shadow-red-500/20' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-transparent shadow-purple-500/30'
            }`}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </motion.button>

          <div className="w-px h-10 bg-white/10"></div>

          <div className="flex flex-col items-center gap-1 text-slate-400">
            <div className="bg-slate-800 p-2 rounded-full">
              <Headphones className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-[10px] font-bold uppercase">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceLounge;
