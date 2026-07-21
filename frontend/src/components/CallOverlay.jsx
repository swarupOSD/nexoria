import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionContext';

const getIceServers = () => {
  const servers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ];
  
  if (import.meta.env.VITE_TURN_URL) {
    servers.push({
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD
    });
  }
  
  return { iceServers: servers };
};

const CallOverlay = ({ user, socket, partner, roomData, callType = 'audio', isReceivingCall, callerSignal, callerInfo, onClose }) => {
  const [stream, setStream] = useState(null);
  const { requestPermission } = usePermissions();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  
  const myVideo = useRef();
  const partnerVideo = useRef();
  const connectionRef = useRef(null);

  const iceQueueRef = useRef([]);

  const flushIceQueue = (peer) => {
    iceQueueRef.current.forEach(c => {
      peer.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error(e));
    });
    iceQueueRef.current = [];
  };

  const initiateCall = (mediaStream) => {
    const peer = new RTCPeerConnection(getIceServers());
    connectionRef.current = peer;

    mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', { to: partner?.socketId || `private_${roomData.teamCode}`, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = event.streams[0];
        // Force play to bypass browser autoplay policies
        partnerVideo.current.play().catch(e => console.error("Error playing media:", e));
      }
    };

    peer.createOffer()
      .then(offer => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit('callUser', {
          userToCall: partner?.socketId || `private_${roomData.teamCode}`,
          signalData: peer.localDescription,
          from: socket.id,
          name: user.name,
          type: callType
        });
      });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.setRemoteDescription(new RTCSessionDescription(signal)).then(() => {
        flushIceQueue(peer);
      });
    });
  };

  useEffect(() => {
    const handleIceCandidate = (candidate) => {
      const peer = connectionRef.current;
      if (peer && peer.remoteDescription) {
        peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      } else {
        iceQueueRef.current.push(candidate);
      }
    };
    socket.on('iceCandidate', handleIceCandidate);

    if (!isReceivingCall) {
      const initCall = async () => {
        const requiredPermission = callType === 'video' ? 'camera' : 'microphone';
        const granted = await requestPermission(requiredPermission);
        if (!granted) {
          toast.error(`${requiredPermission} permission was denied.`);
          onClose();
          return;
        }

        navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
          .then((mediaStream) => {
            setStream(mediaStream);
            if (myVideo.current) myVideo.current.srcObject = mediaStream;
            if (partner) initiateCall(mediaStream);
          })
          .catch(err => {
            console.error("Error accessing media devices.", err);
            if (err.name === 'NotFoundError') toast.error("No Camera or Microphone found on your device!");
            else toast.error("Permission blocked! Click 🔒 in URL bar to allow Camera/Microphone.");
            onClose();
          });
      };
      initCall();
    }

    const handleCallEnded = () => {
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.close();
      setTimeout(() => onClose(), 1500);
    };

    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('iceCandidate', handleIceCandidate);
      socket.off('callEnded', handleCallEnded);
      socket.off('callAccepted');
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (connectionRef.current) connectionRef.current.close();
    };
  }, []);

  const answerCall = async () => {
    const requiredPermission = callType === 'video' ? 'camera' : 'microphone';
    const granted = await requestPermission(requiredPermission);
    if (!granted) {
      toast.error(`${requiredPermission} permission was denied.`);
      rejectCall();
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideo.current) myVideo.current.srcObject = mediaStream;

        setCallAccepted(true);
        const peer = new RTCPeerConnection(getIceServers());
        connectionRef.current = peer;

        mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('iceCandidate', { to: callerInfo.from, candidate: event.candidate });
          }
        };

        peer.ontrack = (event) => {
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = event.streams[0];
            partnerVideo.current.play().catch(e => console.error("Error playing media:", e));
          }
        };

        peer.setRemoteDescription(new RTCSessionDescription(callerSignal))
          .then(() => {
            flushIceQueue(peer);
            return peer.createAnswer();
          })
          .then(answer => peer.setLocalDescription(answer))
          .then(() => {
            socket.emit('answerCall', { to: callerInfo.from, signal: peer.localDescription });
          });
      })
      .catch(err => {
        console.error("Error accessing media for answer.", err);
        if (err.name === 'NotFoundError') toast.error("No Camera or Microphone found on your device!");
        else toast.error("Permission blocked! Click 🔒 in URL bar to allow Camera/Microphone.");
        rejectCall();
      });
  };

  const rejectCall = () => {
    socket.emit('endCall', { to: callerInfo.from });
    onClose();
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit('endCall', { to: isReceivingCall ? callerInfo.from : (partner?.socketId || `private_${roomData.teamCode}`) });
    if (connectionRef.current) connectionRef.current.close();
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#000000] z-[9999] flex flex-col items-center justify-center font-sans"
      >
        {/* If receiving a call and haven't accepted yet */}
        {isReceivingCall && !callAccepted && (
          <div className="flex flex-col items-center justify-center p-8 bg-[#121212] border border-gray-800 rounded-3xl shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
              {callType === 'video' ? <Video className="w-10 h-10 text-white" /> : <Phone className="w-10 h-10 text-white" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{callerInfo.name} is calling...</h2>
            <p className="text-gray-400 mb-8">Incoming {callType} call</p>
            
            <div className="flex gap-6">
              <button onClick={rejectCall} className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
              <button onClick={answerCall} className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                <Phone className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* If call is active or calling */}
        <div className={`relative w-full h-full flex-col items-center justify-center ${(!isReceivingCall || callAccepted) ? 'flex' : 'hidden'}`}>
          
          {/* Main Remote Video (or empty state if audio) */}
          <div className="w-full h-full relative bg-gray-900">
            <video 
              playsInline 
              ref={partnerVideo} 
              autoPlay 
              className={`w-full h-full object-cover ${(!callAccepted || callEnded) ? 'hidden' : ''}`}
            />
            {(!callAccepted || callEnded) && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-[#262626] rounded-full flex items-center justify-center mb-4 animate-pulse">
                  {callType === 'video' ? <Video className="w-10 h-10 text-gray-400" /> : <Phone className="w-10 h-10 text-gray-400" />}
                </div>
                <h2 className="text-xl font-semibold text-white">{callEnded ? 'Call Ended' : 'Calling...'}</h2>
              </div>
            )}
          </div>

          {/* PiP Local Video */}
          <motion.div 
            drag
            dragConstraints={{ top: 0, left: 0, right: 300, bottom: 500 }}
            className="absolute bottom-28 right-6 w-32 h-48 md:w-48 md:h-72 bg-black border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-10 cursor-move"
          >
            <video 
              playsInline 
              muted 
              ref={myVideo} 
              autoPlay 
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
            />
            {isVideoOff && (
              <div className="w-full h-full bg-[#121212] flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </motion.div>

          {/* Call Controls */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#121212]/80 backdrop-blur-md px-6 py-4 rounded-full border border-gray-800">
            <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-[#262626] text-white hover:bg-[#363636]'}`}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button onClick={leaveCall} className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-colors mx-2">
              <PhoneOff className="w-8 h-8" />
            </button>

            <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-[#262626] text-white hover:bg-[#363636]'}`}>
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallOverlay;
