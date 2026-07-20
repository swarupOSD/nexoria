import React, { createContext, useContext, useState, useCallback } from 'react';
import PermissionModal from '../components/PermissionModal';

const PermissionContext = createContext();

export const usePermissions = () => {
  return useContext(PermissionContext);
};

export const PermissionProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    resolve: null,
    status: 'prompt' // 'prompt', 'denied'
  });

  const requestPermission = useCallback(async (type) => {
    return new Promise(async (resolve) => {
      // type can be 'microphone', 'camera', 'notifications'
      let status = 'prompt';
      
      try {
        // Query the permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const res = await navigator.permissions.query({ name: type });
          status = res.state; // 'granted', 'prompt', 'denied'
        } else {
          // Safari fallback: permissions.query might not support 'microphone' or 'camera'
          status = 'prompt';
        }
      } catch (err) {
        // If unsupported or throws an error, default to prompt
        status = 'prompt';
      }

      if (status === 'granted') {
        resolve(true);
        return;
      }

      // Show custom modal
      setModalState({
        isOpen: true,
        type,
        resolve,
        status
      });
    });
  }, []);

  const handleAllow = () => {
    if (modalState.resolve) modalState.resolve(true);
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeny = () => {
    if (modalState.resolve) modalState.resolve(false);
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <PermissionContext.Provider value={{ requestPermission }}>
      {children}
      <PermissionModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        status={modalState.status}
        onAllow={handleAllow}
        onDeny={handleDeny}
      />
    </PermissionContext.Provider>
  );
};
