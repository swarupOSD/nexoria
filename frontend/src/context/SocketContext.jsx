import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if we want it global or we can just always connect.
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
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
