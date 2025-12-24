import React, { useEffect, useState } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';

// Import the Window API for Tauri v2
// If this import fails, run: npm install @tauri-apps/api
import { getCurrentWindow } from '@tauri-apps/api/window';

const TitleBar = () => {
  const [appWindow, setAppWindow] = useState(null);

  useEffect(() => {
    // safely get the window instance once on mount
    const win = getCurrentWindow();
    setAppWindow(win);
  }, []);

  const handleMinimize = () => {
    appWindow?.minimize();
  };

  const handleMaximize = async () => {
    if (appWindow) {
      const isMaximized = await appWindow.isMaximized();
      // toggleMaximize() is the standard V2 method
      appWindow.toggleMaximize(); 
    }
  };

  const handleClose = () => {
    appWindow?.close();
  };

  return (
    <div 
      // This special attribute makes the div draggable by the OS
      data-tauri-drag-region 
      className="fixed top-0 left-0 w-full h-10 bg-[#0d1117] flex justify-between items-center px-4 z-50 select-none border-b border-white/5"
    >
      {/* Left side: App Name (Draggable) */}
      <div className="flex items-center gap-2 pointer-events-none text-xs font-mono text-gray-500 tracking-widest">
        Hobbit
      </div>

      {/* Right side: Window Controls (NOT Draggable) */}
      <div className="flex gap-1">
        
        {/* Minimize */}
        <button 
          onClick={handleMinimize} 
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Minus size={16} />
        </button>

        {/* Maximize */}
        <button 
          onClick={handleMaximize} 
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <Square size={14} />
        </button>

        {/* Close */}
        <button 
          onClick={handleClose} 
          className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
        >
          <X size={16} />
        </button>

      </div>
    </div>
  );
};

export default TitleBar;