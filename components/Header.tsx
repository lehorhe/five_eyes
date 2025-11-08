import React from 'react';
import { EyeIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="p-4 border-b border-cyan-300/20 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <EyeIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-cyan-300">
            FIVE EYES <span className="font-normal text-gray-500">//</span> AGENT ANALIZY MULTIMODALNEJ
          </h1>
        </div>
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </header>
  );
};

export default Header;
