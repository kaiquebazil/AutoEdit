import React from 'react';
import { Film, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Video Silence Cutter
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Corte automático de silêncios em vídeos
              </p>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
