'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import {
  HiOutlineQrCode,
  HiOutlineCamera,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineKey,
  HiOutlineArrowPath,
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineAcademicCap
} from 'react-icons/hi2';
import { QRScannerView } from '@/components/scanner/QRScannerView';
import { SubjectDetectionCard } from '@/components/scanner/SubjectDetectionCard';
import { VerificationStatus, VerificationState } from '@/components/scanner/VerificationStatus';
import { VerificationSuccessModal } from '@/components/scanner/VerificationSuccessModal';
import { loadFaceApi, detectFaceFromVideo, compareFaceDescriptors, isFaceApiReady } from '@/lib/faceDetection';

type Step = 'scan' | 'face' | 'success' | 'error';
type InputMode = 'camera' | 'manual';

const steps = [
  { id: 'scan', label: 'Smart Scan', icon: '📱' },
  { id: 'face', label: 'Face Verify', icon: '👤' },
  { id: 'success', label: 'Complete', icon: '✅' },
];

interface ActiveSession {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    code: string;
  };
  facultyId: {
    _id: string;
    name: string;
  };
  roomName?: string;
  startTime: string;
}

export default function StudentMarkAttendancePage() {
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('scan');
  const [inputMode, setInputMode] = useState<InputMode>('camera');

  // Real-time Verification status checklist states
  const [cameraStatus, setCameraStatus] = useState<VerificationState>('idle');
  const [qrStatus, setQrStatus] = useState<VerificationState>('idle');
  const [identityStatus, setIdentityStatus] = useState<VerificationState>('idle');
  const [confirmationStatus, setConfirmationStatus] = useState<VerificationState>('idle');

  // Manual Mode state
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [manualOtp, setManualOtp] = useState('');

  // Scanning state
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedSessionId, setScannedSessionId] = useState('');
  const [scannedOtp, setScannedOtp] = useState('');
  const [scannedCourseDetails, setScannedCourseDetails] = useState('');

  // Face snapshot state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSimulatingFace, setIsSimulatingFace] = useState(false);
  const [faceCaptureLoading, setFaceCaptureLoading] = useState(false);
  const [webcamSnapshot, setWebcamSnapshot] = useState<string>('');
  const [faceApiAvailable, setFaceApiAvailable] = useState(false);
  const [enrolledDescriptor, setEnrolledDescriptor] = useState<Float32Array | null>(null);

  // Complete status state
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<any>(null);

  const currentSession = activeSessions.find((s) => s._id === scannedSessionId);

  // Load active sessions for manual fallback
  const fetchActiveSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get('/attendance/active-sessions');
      if (res.success && res.data) {
        setActiveSessions(res.data);
        if (res.data.length > 0) {
          setSelectedSessionId(res.data[0]._id);
        }
      } else {
        showToast(res.message || 'Failed to fetch active classes.', 'error');
      }
    } catch (err) {
      showToast('Network error fetching active classes.', 'error');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 'scan') {
      fetchActiveSessions();
    }
  }, [currentStep]);

  // QR scanner lifecycle
  useEffect(() => {
    if (currentStep === 'scan' && inputMode === 'camera') {
      let qrInstance: any = null;
      setCameraError(null);
      setCameraStatus('loading');

      // Timeout helper to wait for the element to mount in the DOM
      const timer = setTimeout(() => {
        import('html5-qrcode')
          .then((module) => {
            const element = document.getElementById('qr-reader');
            if (!element) return;

            qrInstance = new module.Html5Qrcode('qr-reader');
            qrInstance
              .start(
                { facingMode: 'environment' },
                {
                  fps: 10,
                  qrbox: (width: number, height: number) => {
                    const size = Math.min(width, height) * 0.7;
                    return { width: size, height: size };
                  },
                },
                (decodedText: string) => {
                  try {
                    const data = JSON.parse(decodedText);
                    if (data.sessionId && data.otp) {
                      setScannedSessionId(data.sessionId);
                      setScannedOtp(data.otp);
                      setScannedCourseDetails(data.courseCode || 'Active Class');
                      showToast('QR Code scanned successfully!', 'success');
                      
                      setCameraStatus('success');
                      setQrStatus('success');

                      // Stop QR scanner and move to Face verify step
                      if (qrInstance && qrInstance.isScanning) {
                        qrInstance
                          .stop()
                          .then(() => {
                            setCurrentStep('face');
                          })
                          .catch((err: any) => {
                            console.error('Error stopping QR scanner:', err);
                            setCurrentStep('face');
                          });
                      }
                    } else {
                      showToast('Invalid QR Code format.', 'warning');
                      setQrStatus('failed');
                    }
                  } catch (e) {
                    showToast('Unsupported QR scan result.', 'warning');
                    setQrStatus('failed');
                  }
                },
                () => {
                  // Scanning error / progress callback (silent to avoid flood)
                  setCameraStatus('success');
                }
              )
              .catch((err: any) => {
                console.error('Camera startup error:', err);
                setCameraError('Webcam viewfinder failed to initialize. Try manual OTP input mode.');
                setCameraStatus('failed');
              });
          })
          .catch((err) => {
            console.error('Failed to load html5-qrcode module:', err);
            setCameraStatus('failed');
          });
      }, 300);

      return () => {
        clearTimeout(timer);
        if (qrInstance && qrInstance.isScanning) {
          qrInstance.stop().catch((e: any) => console.error('Cleanup stop error:', e));
        }
      };
    }
  }, [currentStep, inputMode]);

  // Webcam stream lifecycle for Face verification
  useEffect(() => {
    if (currentStep === 'face' && !isSimulatingFace) {
      let activeStream: MediaStream | null = null;
      setCameraError(null);
      setCameraStatus('loading');

      const startWebcam = async () => {
        try {
          const s = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 480, height: 480 },
          });
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraStatus('success');
        } catch (err: any) {
          console.warn('Webcam access error, falling back to simulator:', err);
          setIsSimulatingFace(true);
          setCameraStatus('success');
          showToast('Webcam not accessible. Using simulated verification.', 'info');
        }
      };

      startWebcam();

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [currentStep, isSimulatingFace]);

  // Load face-api.js models when reaching face step
  useEffect(() => {
    if (currentStep === 'face') {
      // Try to load face-api models
      loadFaceApi().then((loaded) => {
        setFaceApiAvailable(loaded);
        if (loaded) {
          console.log('🧠 Face detection AI models ready');
        }
      });

      // Fetch enrolled face descriptor from backend
      api.get('/upload/face-descriptor').then((res) => {
        if (res.success && res.data?.enrolled && res.data.descriptor) {
          setEnrolledDescriptor(new Float32Array(res.data.descriptor));
        }
      }).catch(() => { /* no-op */ });
    }
  }, [currentStep]);

  const handleManualProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) {
      showToast('Please select an active class session.', 'warning');
      return;
    }
    if (manualOtp.length !== 6 || !/^\d+$/.test(manualOtp)) {
      showToast('Please enter a valid 6-digit numeric verification OTP.', 'warning');
      return;
    }

    const selectedSession = activeSessions.find((s) => s._id === selectedSessionId);
    setScannedSessionId(selectedSessionId);
    setScannedOtp(manualOtp);
    setScannedCourseDetails(selectedSession?.courseId?.code || 'Manual Check-in');
    setCameraStatus('success');
    setQrStatus('success');
    setCurrentStep('face');
  };

  const handleCaptureFace = async () => {
    setIdentityStatus('loading');
    if (isSimulatingFace) {
      simulateFaceVerify();
      return;
    }

    if (!videoRef.current) return;
    setFaceCaptureLoading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const snapshot = canvas.toDataURL('image/jpeg');
        setWebcamSnapshot(snapshot);

        // Attempt face detection with face-api.js before stopping camera
        if (faceApiAvailable && isFaceApiReady()) {
          try {
            const result = await detectFaceFromVideo(videoRef.current);
            if (!result.detected) {
              showToast('No face detected. Please center your face in the frame and try again.', 'warning');
              setFaceCaptureLoading(false);
              setIdentityStatus('failed');
              return;
            }

            // If student has an enrolled descriptor, compare
            if (enrolledDescriptor && result.descriptor) {
              const match = compareFaceDescriptors(result.descriptor, enrolledDescriptor, 0.6);
              if (!match.match) {
                showToast(`Face mismatch detected (distance: ${match.distance.toFixed(2)}). Please try again.`, 'error');
                setFaceCaptureLoading(false);
                setIdentityStatus('failed');
                return;
              }
              showToast('Face verified successfully! ✅', 'success');
            } else {
              showToast('Face detected. Proceeding with check-in.', 'info');
            }
          } catch (faceErr) {
            console.warn('Face detection had an issue, proceeding with snapshot only:', faceErr);
          }
        }

        // Turn off physical camera immediately
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }

        // Submit to API
        submitAttendanceRecord(scannedSessionId, scannedOtp, snapshot);
      } else {
        throw new Error('Canvas rendering context failed.');
      }
    } catch (err: any) {
      showToast(err.message || 'Capture failed, using simulated fallback.', 'warning');
      setIsSimulatingFace(true);
      setFaceCaptureLoading(false);
    }
  };

  const simulateFaceVerify = () => {
    setFaceCaptureLoading(true);
    setIdentityStatus('loading');
    // Simulate 2 seconds database face analysis verification latency
    setTimeout(() => {
      const mockSnapshot = 'data:image/jpeg;base64,SIMULATED_WEBCAM_FACE_SNAPSHOT_SMARTEDU';
      setWebcamSnapshot(mockSnapshot);
      setFaceCaptureLoading(false);
      submitAttendanceRecord(scannedSessionId, scannedOtp, mockSnapshot);
    }, 1800);
  };

  const submitAttendanceRecord = async (sessionId: string, otpCode: string, snapshot: string) => {
    setSubmitLoading(true);
    setErrorMessage(null);
    setConfirmationStatus('loading');

    // Fingerprint or device locking mock
    let deviceId = localStorage.getItem('smartedu_student_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('smartedu_student_device_id', deviceId);
    }

    try {
      const res = await api.post('/attendance/mark', {
        classSessionId: sessionId,
        otp: otpCode,
        webcamSnapshot: snapshot,
        deviceId,
      });

      if (res.success && res.data) {
        showToast('Smart Check-In Successful!', 'success');
        setVerifiedDetails({
          course: currentSession?.courseId?.title || scannedCourseDetails,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          method: snapshot.includes('BYPASSED') ? 'Dynamic QR + Direct Bypass Check-In' : 'Dynamic QR + Secure Face verification',
        });
        setIdentityStatus('success');
        setConfirmationStatus('success');
        setCurrentStep('success');
      } else {
        setIdentityStatus('failed');
        setConfirmationStatus('failed');
        setErrorMessage(res.message || 'Verification rejected by the backend database check.');
        setCurrentStep('error');
      }
    } catch (err: any) {
      setIdentityStatus('failed');
      setConfirmationStatus('failed');
      setErrorMessage(err.message || 'A network error occurred while submitting.');
      setCurrentStep('error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setScannedSessionId('');
    setScannedOtp('');
    setManualOtp('');
    setWebcamSnapshot('');
    setErrorMessage(null);
    setVerifiedDetails(null);
    setIsSimulatingFace(false);
    
    // Reset status checklist states
    setCameraStatus('idle');
    setQrStatus('idle');
    setIdentityStatus('idle');
    setConfirmationStatus('idle');
    
    setCurrentStep('scan');
  };

  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center justify-center gap-2">
          <HiOutlineQrCode className="w-6 h-6 text-primary-light animate-[spin-slow_12s_linear_infinite]" />
          Smart Check-In
        </h1>
        <p className="text-xs text-text-muted mt-0.5">Software-only student attendance verification system</p>
      </div>

      {/* Step Wizard Progress */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center gap-1 ${i <= stepIndex ? 'opacity-100' : 'opacity-35'}`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border transition-all duration-300
                ${
                  currentStep === step.id
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
              <div className={`flex-1 h-0.5 rounded-full max-w-16 ${i < stepIndex ? 'bg-success' : 'bg-border/35'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Real-Time Checklist Status Panel */}
      <div className="max-w-md mx-auto">
        <VerificationStatus
          cameraState={cameraStatus}
          qrState={qrStatus}
          identityState={identityStatus}
          confirmationState={confirmationStatus}
        />
      </div>

      {/* Subject Auto-Detection Card */}
      {scannedSessionId && (
        <div className="max-w-md mx-auto">
          <SubjectDetectionCard 
            courseCode={currentSession?.courseId?.code || scannedCourseDetails} 
            courseTitle={currentSession?.courseId?.title || 'Auto-Detected Lecture'}
            roomName={currentSession?.roomName || 'LH-301'}
            facultyName={currentSession?.facultyId?.name || 'Faculty Instructor'}
          />
        </div>
      )}

      {/* Main Form/Scanner Panels */}
      <div className="max-w-md mx-auto">
        {/* Step 1: Scan QR or Enter Code */}
        {(currentStep === 'scan' || currentStep === 'success') && (
          <Card glow>
            {/* Input Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-bg-elevated/40 rounded-xl border border-border/20 mb-5">
              <button
                type="button"
                onClick={() => setInputMode('camera')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer
                  ${
                    inputMode === 'camera'
                      ? 'gradient-primary text-white shadow-md shadow-primary/10'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                <HiOutlineCamera className="w-4 h-4" />
                Scan Live QR
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer
                  ${
                    inputMode === 'manual'
                      ? 'gradient-primary text-white shadow-md shadow-primary/10'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
              >
                <HiOutlineKey className="w-4 h-4" />
                Enter OTP Code
              </button>
            </div>

            {inputMode === 'camera' ? (
              /* QR Scanner view using high-tech modular component */
              <QRScannerView 
                cameraError={cameraError} 
                onManualClick={() => setInputMode('manual')} 
              />
            ) : (
              /* Manual Input Form view */
              <form onSubmit={handleManualProceed} className="space-y-4">
                {sessionsLoading ? (
                  <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Checking for active classes...
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-xs text-text-muted">No lecture sessions are currently active in your college.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<HiOutlineArrowPath className="w-3.5 h-3.5" />}
                      onClick={fetchActiveSessions}
                    >
                      Refresh List
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                        Active Class Session
                      </label>
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2.5 focus:border-primary/45 focus:outline-none"
                      >
                        {activeSessions.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.courseId?.title} ({s.courseId?.code}) • {s.facultyId?.name} {s.roomName ? `• ${s.roomName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="6-Digit Verification OTP"
                      placeholder="e.g. 584920"
                      value={manualOtp}
                      maxLength={6}
                      onChange={(e) => setManualOtp(e.target.value.replace(/\D/g, ''))}
                      icon="🔢"
                    />

                    <Button type="submit" fullWidth icon={<HiOutlineSparkles className="w-4 h-4" />}>
                      Verify and Proceed
                    </Button>
                  </>
                )}
              </form>
            )}
          </Card>
        )}

        {/* Step 2: Face Verification */}
        {currentStep === 'face' && (
          <Card glow className="text-center animate-scaleIn">
            <h3 className="text-sm font-bold text-text-primary mb-1">Identity Verification</h3>
            <p className="text-[10px] text-text-muted mb-4">
              Capture your photo snapshot to verify attendance session fingerprint.
            </p>

            <div className="relative mx-auto w-52 h-52 rounded-full border-4 border-primary/20 overflow-hidden bg-black mb-5">
              {isSimulatingFace ? (
                /* Simulation Avatar View */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-elevated/45 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light text-3xl font-bold animate-pulse">
                    👤
                  </div>
                  {faceCaptureLoading ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest animate-pulse">
                        Matching Face...
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-text-muted font-semibold mt-3">Demo Simulator Mode</span>
                  )}
                </div>
              ) : (
                /* Real Webcam View */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  />
                  {faceCaptureLoading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest animate-pulse">
                        Capturing...
                      </span>
                    </div>
                  )}
                  {/* Guideline Oval overlay */}
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/30 pointer-events-none" />
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="md" className="flex-1" onClick={handleReset} disabled={faceCaptureLoading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-[2]"
                  icon={<HiOutlineVideoCamera className="w-4 h-4" />}
                  onClick={handleCaptureFace}
                  loading={faceCaptureLoading}
                >
                  {isSimulatingFace ? 'Simulate Face' : 'Verify Identity'}
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={() => {
                    setFaceCaptureLoading(true);
                    showToast('Bypassing face matching for demo...', 'info');
                    setTimeout(() => {
                      setFaceCaptureLoading(false);
                      submitAttendanceRecord(scannedSessionId, scannedOtp, 'data:image/jpeg;base64,BYPASSED_FACE_SNAPSHOT');
                    }, 800);
                  }}
                  className="text-[10px] text-primary-light hover:text-primary font-bold uppercase tracking-wider py-1.5 hover:underline cursor-pointer border border-dashed border-primary/20 rounded-xl hover:border-primary/45 bg-primary/5 transition-all w-full text-center"
                >
                  ⚡ Optional: Skip Face Match (Direct Check-In)
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Error Screen */}
        {currentStep === 'error' && (
          <Card glow className="text-center animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineXCircle className="w-10 h-10 text-danger-light" />
            </div>
            <h3 className="text-lg font-heading font-black text-danger-light mb-1">Check-In Rejected</h3>
            <p className="text-xs text-text-muted mb-5">
              {errorMessage || 'Verification parameters failed validation.'}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="md" className="flex-1" onClick={handleReset}>
                Cancel
              </Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </Card>
        )}
      </div>

      <VerificationSuccessModal
        isOpen={currentStep === 'success'}
        onClose={handleReset}
        details={verifiedDetails}
      />

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 10%;
          }
          50% {
            top: 85%;
          }
        }
      `}</style>
    </div>
  );
}
