'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HiOutlineQrCode, HiOutlineCamera, HiOutlineWifi, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

type Step = 'scan' | 'wifi' | 'face' | 'success' | 'error';

const steps = [
  { id: 'scan', label: 'Scan QR', icon: '📱' },
  { id: 'wifi', label: 'Wi-Fi Check', icon: '📶' },
  { id: 'face', label: 'Face Verify', icon: '👤' },
  { id: 'success', label: 'Done', icon: '✅' },
];

export default function StudentMarkAttendancePage() {
  const [currentStep, setCurrentStep] = useState<Step>('scan');
  const [scanning, setScanning] = useState(false);

  const simulateFlow = () => {
    setScanning(true);
    setCurrentStep('scan');
    setTimeout(() => setCurrentStep('wifi'), 2000);
    setTimeout(() => setCurrentStep('face'), 3500);
    setTimeout(() => { setCurrentStep('success'); setScanning(false); }, 5500);
  };

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center justify-center gap-2">
          <HiOutlineQrCode className="w-6 h-6 text-primary-light" />
          Mark Attendance
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Scan QR code displayed by your faculty</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center gap-1 ${i <= stepIndex ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all
                ${currentStep === step.id
                  ? 'gradient-primary border-primary/30 shadow-lg shadow-primary/20 scale-110'
                  : i < stepIndex
                    ? 'bg-success/15 border-success/30 text-success-light'
                    : 'bg-bg-elevated border-border/30'
                }`}
              >
                {i < stepIndex ? '✓' : step.icon}
              </div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full max-w-12 ${i < stepIndex ? 'bg-success' : 'bg-border/30'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto">
        {/* QR Scanner Step */}
        {currentStep === 'scan' && (
          <Card className="text-center">
            <div className="relative mx-auto w-64 h-64 rounded-2xl bg-gray-900 overflow-hidden mb-4 border border-border/30">
              {/* Camera viewfinder simulation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary/40 rounded-2xl relative">
                  {/* Corner markers */}
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  {/* Scanning line */}
                  {scanning && (
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                      style={{ animation: 'scan 2s ease-in-out infinite', top: '20%' }}
                    />
                  )}
                </div>
              </div>
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                  <HiOutlineCamera className="w-10 h-10 text-text-muted mb-2" />
                  <span className="text-[10px] text-text-muted">Camera preview</span>
                </div>
              )}
            </div>
            <p className="text-xs text-text-secondary mb-4">
              {scanning ? 'Scanning QR code...' : 'Point your camera at the QR code on the classroom screen'}
            </p>
            <Button variant="primary" size="lg" fullWidth icon={<HiOutlineQrCode className="w-5 h-5" />}
              onClick={simulateFlow} loading={scanning}
            >
              {scanning ? 'Scanning...' : 'Start Scanner'}
            </Button>
          </Card>
        )}

        {/* Wi-Fi Check */}
        {currentStep === 'wifi' && (
          <Card className="text-center animate-scaleIn">
            <div className="w-20 h-20 rounded-2xl gradient-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
              <HiOutlineWifi className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-sm font-heading font-bold text-text-primary mb-1">Verifying Wi-Fi Proximity</h3>
            <p className="text-[11px] text-text-muted mb-4">Checking if you are connected to classroom network...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </Card>
        )}

        {/* Face Verification */}
        {currentStep === 'face' && (
          <Card className="text-center animate-scaleIn">
            <div className="relative mx-auto w-48 h-48 rounded-full border-4 border-primary/30 mb-4 overflow-hidden bg-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-40 border-2 border-dashed border-primary/50 rounded-[50%]" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse" />
            </div>
            <h3 className="text-sm font-heading font-bold text-text-primary mb-1">Face Verification</h3>
            <p className="text-[11px] text-text-muted mb-4">Position your face within the oval guide</p>
            <Badge variant="primary" dot pulse>Analyzing...</Badge>
          </Card>
        )}

        {/* Success */}
        {currentStep === 'success' && (
          <Card className="text-center animate-scaleIn">
            <div className="w-20 h-20 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle className="w-12 h-12 text-success-light" />
            </div>
            <h3 className="text-lg font-heading font-black text-success-light mb-1">Attendance Marked! ✓</h3>
            <p className="text-[11px] text-text-muted mb-4">Your attendance has been verified and recorded successfully.</p>
            <div className="bg-bg-elevated/50 rounded-xl p-4 text-left space-y-2 mb-4">
              {[
                { label: 'Course', value: 'Data Structures (CSC-201)' },
                { label: 'Faculty', value: 'Dr. Rajesh Kumar' },
                { label: 'Time', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Verification', value: 'QR + Wi-Fi + Face Recognition' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">{item.label}</span>
                  <span className="text-[11px] font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="md" fullWidth onClick={() => setCurrentStep('scan')}>
              Scan Another Class
            </Button>
          </Card>
        )}

        {/* Error */}
        {currentStep === 'error' && (
          <Card className="text-center animate-scaleIn">
            <div className="w-20 h-20 rounded-full bg-danger/15 border-2 border-danger/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineXCircle className="w-12 h-12 text-danger-light" />
            </div>
            <h3 className="text-lg font-heading font-black text-danger-light mb-1">Verification Failed</h3>
            <p className="text-[11px] text-text-muted mb-4">Face recognition did not match. Please try again.</p>
            <Button variant="primary" size="md" fullWidth onClick={() => setCurrentStep('scan')}>
              Try Again
            </Button>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </div>
  );
}
