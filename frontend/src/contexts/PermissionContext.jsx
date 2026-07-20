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
    let permStatus = 'prompt';
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const res = await navigator.permissions.query({ name: type });
        permStatus = res.state;
      }
    } catch (err) {
      permStatus = 'prompt';
    }

    if (permStatus === 'granted') {
      return true;
    }

    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type,
        resolve,
        status: permStatus
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
