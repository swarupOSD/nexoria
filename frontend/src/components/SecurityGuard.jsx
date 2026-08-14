import React, { useEffect } from 'react';

const SecurityGuard = ({ children }) => {
  useEffect(() => {
    // 1. Prevent Right Click
    const handleContextMenu = (e) => e.preventDefault();

    // 2. Prevent Keyboard Shortcuts for DevTools & Source
    const handleKeyDown = (e) => {
      // Prevent F12, F10, F6, PrintScreen
      if (e.key === 'F12' || e.key === 'F10' || e.key === 'F6' || e.key === 'PrintScreen') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'i' || key === 'j' || key === 'c') {
          e.preventDefault();
        }
      }
      
      // Prevent Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print), Ctrl+A (Select All)
      if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === 'u' || key === 's' || key === 'p' || key === 'a') {
          e.preventDefault();
        }
      }
    };

    // 3. Prevent Copy, Cut, Paste, Drag, Drop
    const preventDefault = (e) => e.preventDefault();
    
    // 4. Advanced: DevTools Debugger Trap
    // If DevTools is opened from the browser menu, it will infinitely pause execution
    let debuggerTrap;
    const initDebuggerTrap = () => {
      debuggerTrap = setInterval(() => {
        const before = new Date().getTime();
        // eslint-disable-next-line no-debugger
        debugger; 
        const after = new Date().getTime();
        // If debugger is active, the time difference will be large
        if (after - before > 100) {
          // You could optionally clear the screen here if they pause it
          // document.body.innerHTML = "Security Access Denied";
        }
      }, 50);
    };
    initDebuggerTrap();

    // 5. Clear Console Trap
    const consoleTrap = setInterval(() => {
      console.clear();
      console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;");
      console.log("%cThis is a restricted browser feature intended for developers. Turn back.", "color: gray; font-size: 16px;");
    }, 1000);

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('drop', preventDefault);
    
    // Prevent Printing via CSS/Events
    window.addEventListener('beforeprint', preventDefault);

    return () => {
      // Cleanup
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('drop', preventDefault);
      window.removeEventListener('beforeprint', preventDefault);
      clearInterval(debuggerTrap);
      clearInterval(consoleTrap);
    };
  }, []);

  return (
    <div 
      className="security-wrapper w-full h-full min-h-screen"
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none', 
        MozUserSelect: 'none', 
        msUserSelect: 'none',
        WebkitTouchCallout: 'none' // Disable long-touch menu on iOS
      }}
    >
      <style>{`
        input, textarea, [contenteditable="true"] {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
        /* Hide everything when trying to print */
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default SecurityGuard;
