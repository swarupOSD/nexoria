import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Users, Headphones, VideoOff, Crown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

const VoiceLounge = () => {
  const { user } = useSelector(state => state.auth);
  const { requestPermission } = usePermissions();
  
  const [participants, setParticipants] = useState({}); // { [userId]: { ...info, stream, isSpeaking, isMuted } }
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
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
      
      setupSpeechDetection(remoteStream, targetUserId);
    };

    return peer;
  };

  useEffect(() => {
    if (!user || (!user.isPremium && !['admin', 'superadmin', 'owner'].includes(user.role))) return;

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
  }, [user]);

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

  return (
    <div className="min-h-screen bg-[#0a0d14] pt-24 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 z-10 flex-1 flex flex-col items-center">
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
