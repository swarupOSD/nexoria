import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { BACKEND_URL } from '../features/api/apiSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Derive the socket origin from BACKEND_URL (strip /api suffix)
    const SOCKET_URL = BACKEND_URL.endsWith('/api') ? BACKEND_URL.slice(0, -4) : BACKEND_URL;
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Global listener for new direct messages to show toast notification
    const handleNewDM = (message) => {
      if (user && message.sender._id !== user._id) {
        import('react-hot-toast').then(({ default: toast }) => {
          toast(`New message from ${message.sender.name}`, { icon: '💬' });
        });
      }
    };
    newSocket.on('newDirectMessage', handleNewDM);

    return () => {
      newSocket.off('newDirectMessage', handleNewDM);
      newSocket.disconnect();
    };
  }, [user]); // Reconnect when user changes to update auth/roles if necessary

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
