import React from 'react';
import { Heart, Cpu, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Video Silence Cutter. Código aberto.
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-accent-500" />
              <span>FastAPI</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-primary-500" />
              <span>FFmpeg</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>React</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
