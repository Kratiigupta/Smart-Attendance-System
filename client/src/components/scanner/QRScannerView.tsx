'use client';

import React from 'react';
import { HiOutlineXCircle } from 'react-icons/hi2';

interface QRScannerViewProps {
  cameraError: string | null;
  onManualClick?: () => void;
  className?: string;
}

export function QRScannerView({ cameraError, onManualClick, className = '' }: QRScannerViewProps) {
  return (
    <div className={`space-y-4 text-center ${className}`}>
      <div className="relative mx-auto w-64 h-64 rounded-2xl bg-black overflow-hidden border border-border/40 shadow-2xl flex items-center justify-center group">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
            <HiOutlineXCircle className="w-10 h-10 text-danger mb-2.5" />
            <p className="text-[10px] text-text-muted leading-relaxed">{cameraError}</p>
            {onManualClick && (
              <button 
                type="button" 
                onClick={onManualClick}
                className="mt-3.5 px-3 py-1.5 rounded-lg border border-border/30 hover:border-primary/40 bg-bg-secondary hover:bg-bg-hover text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                Use Manual Code
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Native viewfinder mounting div */}
            <div id="qr-reader" className="w-full h-full" />
            
            {/* Cyberpunk HUD style scanner overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border border-primary/20 rounded-2xl relative shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                {/* 4 Glowing Corners */}
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl shadow-[0_0_8px_var(--color-primary)]" />
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr shadow-[0_0_8px_var(--color-primary)]" />
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl shadow-[0_0_8px_var(--color-primary)]" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br shadow-[0_0_8px_var(--color-primary)]" />
                
                {/* Pulsing horizontal scan line */}
                <div className="absolute left-1 right-1 h-0.5 bg-primary shadow-[0_0_10px_var(--color-primary)] animate-[scanLaser_2.5s_ease-in-out_infinite]" />
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes scanLaser {
          0%, 100% {
            top: 5%;
            opacity: 0.2;
          }
          50% {
            top: 92%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
