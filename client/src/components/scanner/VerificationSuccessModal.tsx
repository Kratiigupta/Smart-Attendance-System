'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { HiOutlineCheckBadge, HiOutlineSparkles, HiOutlineIdentification } from 'react-icons/hi2';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: {
    course: string;
    time: string;
    method: string;
  } | null;
  className?: string;
}

export function VerificationSuccessModal({
  isOpen,
  onClose,
  details,
  className = '',
}: VerificationSuccessModalProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const colors = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899'];
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // percentage width
        delay: Math.random() * 2, // seconds delay
        color: colors[i % colors.length]
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isOpen]);

  if (!details) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verification Complete"
      size="md"
    >
      <div className={`space-y-6 flex flex-col items-center relative overflow-hidden ${className}`}>
        {/* Animated Confetti Canvas Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 rounded-sm opacity-80 animate-[confettiDrop_2.5s_linear_infinite]"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                backgroundColor: p.color,
                top: '-10px'
              }}
            />
          ))}
        </div>

        {/* Circular Checkmark Badge */}
        <div className="w-20 h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center relative z-10 animate-[scaleIn_0.4s_ease-out]">
          <HiOutlineCheckBadge className="w-12 h-12 text-success-light" />
        </div>

        <div className="text-center space-y-1 relative z-10">
          <h3 className="text-lg font-heading font-black text-success-light">Smart Check-In Complete!</h3>
          <p className="text-xs text-text-muted">Your lecture attendance has been securely updated in the database.</p>
        </div>

        {/* Digital Verification Receipt */}
        <div className="w-full bg-bg-secondary border border-border/20 rounded-2xl p-4 space-y-3 relative z-10 select-none max-w-xs shadow-inner">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-border/20 pb-2 mb-1 flex items-center justify-between">
            <span>Official Receipt</span>
            <span className="text-primary-light">Secure Node</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">Course Code</span>
            <span className="font-bold text-text-primary truncate max-w-[150px]">{details.course}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">Check-In Time</span>
            <span className="font-bold text-text-primary">{details.time}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">Security Method</span>
            <span className="font-bold text-text-primary text-[10px] flex items-center gap-1.5">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-primary-light animate-pulse" />
              {details.method}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-xs relative z-10">
          <Button variant="primary" size="md" fullWidth onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confettiDrop {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(320px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Modal>
  );
}
