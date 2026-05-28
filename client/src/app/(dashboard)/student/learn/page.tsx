'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/components/ui/Toast';
import {
  HiOutlineBookOpen,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineGlobeAlt,
  HiOutlineSignal,
  HiOutlineSignalSlash,
  HiOutlinePlay,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Lesson {
  id: string;
  _id?: string;
  title: string;
  subject: string;
  type: 'Video' | 'Document';
  language: 'English' | 'Hindi' | 'Punjabi';
  duration: string;
  size: string;
  description: string;
  downloaded: boolean;
  contentBody?: string;
  videoUrl?: string;
  quizQuestions?: { question: string; options: string[]; answer: number }[];
}

const languageFlags = {
  English: '🇬🇧 EN',
  Hindi: '🇮🇳 हिं',
  Punjabi: '🇮🇳 ਪੰ',
};

export default function StudentLearn() {
  const { showToast } = useToast();
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [installingPWA, setInstallingPWA] = useState(false);
  
  // Fetch real lessons from backend
  const { data: lessonsData = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ['studentLessons'],
    queryFn: async () => {
      const res = await api.get('/learn/lessons');
      if (!res.success) throw new Error(res.message || 'Failed to fetch lessons');
      return (res.data || []).map((l: any) => ({ ...l, id: l._id || l.id }));
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (lessonsData) {
      setLessons(lessonsData);
    }
  }, [lessonsData]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Simulated Connection State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Downloader Simulation State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  
  // Viewer states
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  // Quiz states
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [unsyncedQuizzes, setUnsyncedQuizzes] = useState<{ id: string; score: number }[]>([]);

  // Filter lessons based on language, search, and online status (if offline, show only downloaded)
  const filteredLessons = lessons.filter((lesson) => {
    const matchesLanguage = selectedLanguage === 'All' || lesson.language === selectedLanguage;
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOffline = isOnline || lesson.downloaded;
    return matchesLanguage && matchesSearch && matchesOffline;
  });

  const handleDownload = (id: string) => {
    if (!isOnline) {
      alert('Must be online to download new lessons.');
      return;
    }
    setDownloadingId(id);
    setDownloadProgress(0);
  };

  // Simulate download progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadingId !== null) {
      timer = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setLessons((prevLessons) =>
              prevLessons.map((l) => (l.id === downloadingId ? { ...l, downloaded: true } : l))
            );
            setDownloadingId(null);
            return 0;
          }
          return prev + 10;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [downloadingId]);

  const handleOpenLesson = (lesson: Lesson) => {
    if (!isOnline && !lesson.downloaded) {
      alert('This lesson is not downloaded and cannot be viewed offline.');
      return;
    }
    setActiveLesson(lesson);
    setQuizScore(null);
    setSelectedAnswers({});
    setIsViewerOpen(true);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson?.quizQuestions) return;

    let score = 0;
    activeLesson.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score += 1;
      }
    });

    setQuizScore(score);

    // Save offline if simulated offline
    if (!isOnline) {
      setUnsyncedQuizzes([...unsyncedQuizzes, { id: activeLesson.id, score }]);
    }
  };

  const handleSyncData = () => {
    alert(`Syncing ${unsyncedQuizzes.length} offline quiz records to server... Done!`);
    setUnsyncedQuizzes([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Connection Simulator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Offline Learning Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Access curriculum-mapped content in regional languages. Download lessons for offline study.
          </p>
        </div>
        
        {/* Network Connection Toggle (Simulated for Demo) */}
        <div className="flex items-center gap-3 bg-bg-secondary border border-border/40 px-3.5 py-1.5 rounded-xl">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Network:</span>
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              if (isOnline) {
                // Going offline, close downloads
                setDownloadingId(null);
              }
            }}
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-black transition-all ${
              isOnline
                ? 'bg-success/15 text-success-light border border-success/20'
                : 'bg-danger/15 text-danger-light border border-danger/20'
            }`}
          >
            {isOnline ? (
              <>
                <HiOutlineSignal className="w-3.5 h-3.5" />
                <span>ONLINE (CLOUDSYNCED)</span>
              </>
            ) : (
              <>
                <HiOutlineSignalSlash className="w-3.5 h-3.5" />
                <span>OFFLINE MODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline Status Sync Banner */}
      {!isOnline && (
        <div className="bg-warning/10 border border-warning/20 text-warning-light p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <HiOutlineSignalSlash className="w-5 h-5 shrink-0" />
            <span>Currently viewing offline local downloads. Some files might be locked until internet connection is restored.</span>
          </div>
          {unsyncedQuizzes.length > 0 && (
            <Button variant="outline" size="xs" onClick={handleSyncData} className="border-warning/30 hover:bg-warning/20 text-warning-light shrink-0">
              Sync {unsyncedQuizzes.length} Offline Quizzes
            </Button>
          )}
        </div>
      )}

      {/* PWA Banner & Progress widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PWA Installation Prompt banner */}
        {!pwaInstalled && (
          <div className="lg:col-span-1 border border-primary/20 bg-primary/5 rounded-2xl p-4 flex flex-col justify-between h-36">
            <div>
              <span className="text-[10px] font-bold text-primary-light uppercase tracking-wider block">Offline Campus App</span>
              <h3 className="text-xs font-bold text-text-primary mt-1">📲 Install SmartEdu Campus Web App</h3>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                Access your lessons, notifications, and mark attendance offline even in rural areas without coverage.
              </p>
            </div>
            <Button
              variant="primary"
              size="xs"
              loading={installingPWA}
              onClick={() => {
                setInstallingPWA(true);
                setTimeout(() => {
                  setInstallingPWA(false);
                  setPwaInstalled(true);
                  showToast('SmartEdu Campus App installed successfully!', 'success');
                }, 2000);
              }}
              className="mt-3 w-fit"
            >
              Install App
            </Button>
          </div>
        )}

        {pwaInstalled && (
          <div className="lg:col-span-1 border border-success/20 bg-success/5 rounded-2xl p-4 flex flex-col justify-between h-36">
            <div>
              <span className="text-[10px] font-bold text-success-light uppercase tracking-wider block">Installed</span>
              <h3 className="text-xs font-bold text-text-primary mt-1">SmartEdu Campus App is Active</h3>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                Offline synchronization database has been registered on your home launcher.
              </p>
            </div>
            <div className="text-[10px] text-success-light font-bold flex items-center gap-1">
              <HiOutlineCheckCircle className="w-4 h-4" /> Device Registered ✓
            </div>
          </div>
        )}

        {/* Learning progress tracker */}
        <div className="lg:col-span-1 border border-border/40 bg-bg-secondary rounded-2xl p-4 flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Course Progress</span>
            <h3 className="text-xs font-bold text-text-primary mt-1">4 of 6 Lessons Completed</h3>
            <p className="text-[10px] text-text-muted mt-1">Verify quizzes to increase rate.</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>66% Complete</span>
            </div>
            <ProgressBar value={66} max={100} size="xs" color="success" />
          </div>
        </div>

        {/* Gamified Badges & Streaks */}
        <div className="lg:col-span-1 border border-border/40 bg-bg-secondary rounded-2xl p-4 flex flex-col justify-between h-36">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Learning Rewards</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-text-primary">🔥 8-Day Attendance Streak</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/25 text-primary-light text-[9px] font-extrabold flex items-center gap-0.5">
                📚 Rural Scholar
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-success/10 border border-success/25 text-success-light text-[9px] font-extrabold flex items-center gap-0.5">
                ⚡ Quick Learner
              </span>
            </div>
          </div>
          <span className="text-[9px] text-text-dim block">Keep learning to unlock your next milestone badge!</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <HiOutlineGlobeAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search learning modules, subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary/50 text-text-primary placeholder:text-text-dim transition-colors"
          />
        </div>

        {/* Language selector tabs */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Language</span>
          <div className="flex bg-bg-secondary border border-border/40 p-0.5 rounded-xl">
            {(['All', 'English', 'Hindi', 'Punjabi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  selectedLanguage === lang
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {lang !== 'All' && <span>{languageFlags[lang].split(' ')[0]}</span>}
                <span>{lang}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Content Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 border-t-2"
              style={{ borderTopColor: lesson.downloaded ? '#10b981' : '#6366f1' }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant={lesson.type === 'Video' ? 'primary' : 'success'} size="xs" icon={lesson.type === 'Video' ? <HiOutlinePlay className="w-3 h-3" /> : <HiOutlineDocumentText className="w-3 h-3" />}>
                    {lesson.type}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default" size="xs">
                      {languageFlags[lesson.language]}
                    </Badge>
                    {lesson.downloaded && (
                      <Badge variant="success" size="xs">
                        Local
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-primary mt-3 line-clamp-1">{lesson.title}</h3>
                <p className="text-[9px] text-text-muted font-bold tracking-wider uppercase mt-0.5">{lesson.subject} • {lesson.size}</p>
                <p className="text-[11px] text-text-secondary mt-2 line-clamp-2 leading-relaxed font-medium">
                  {lesson.description}
                </p>
              </div>

              {/* Action Button Section */}
              <div className="mt-4 pt-3 border-t border-border/15 flex items-center justify-between gap-2">
                <span className="text-[10px] text-text-dim flex items-center gap-1">
                  <HiOutlineBookOpen className="w-3.5 h-3.5" />
                  {lesson.duration}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Download button */}
                  {!lesson.downloaded && downloadingId !== lesson.id && (
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<HiOutlineArrowDownTray className="w-3.5 h-3.5" />}
                      disabled={!isOnline}
                      onClick={() => handleDownload(lesson.id)}
                    >
                      Download
                    </Button>
                  )}

                  {downloadingId === lesson.id && (
                    <div className="w-24 text-right pr-2">
                      <ProgressBar value={downloadProgress} max={100} size="xs" showLabel color="primary" />
                    </div>
                  )}

                  {/* Read/Play button */}
                  <Button
                    variant={lesson.downloaded ? 'success' : 'primary'}
                    size="xs"
                    onClick={() => handleOpenLesson(lesson)}
                  >
                    {lesson.type === 'Video' ? 'Play Session' : 'Read Lesson'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-text-muted text-xs">
            {isOnline ? 'No matching lessons found.' : 'No downloaded lessons match your filter. Connect online to fetch new classes.'}
          </div>
        )}
      </div>

      {/* Lesson Viewer Modal */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={activeLesson?.title || 'Lesson Viewer'}
        size="lg"
      >
        {activeLesson && (
          <div className="space-y-6 text-xs text-text-secondary">
            {/* Viewer Display */}
            {activeLesson.type === 'Video' ? (
              <div className="relative aspect-video rounded-xl bg-black flex items-center justify-center border border-border/20 overflow-hidden shadow-inner">
                {/* Simulated custom play interface */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-secondary/40 backdrop-blur-[1px] p-4 text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary-light flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
                    <HiOutlinePlay className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">Simulated Video Playback</div>
                    <div className="text-[10px] text-text-dim mt-0.5">Streaming {activeLesson.title}</div>
                  </div>
                </div>
                {/* Visual grid texture to look techy */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e1d3d_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              </div>
            ) : (
              /* Document Viewer */
              <div className="p-4 rounded-xl bg-bg-secondary border border-border/15 max-h-56 overflow-y-auto leading-relaxed text-text-primary/90 font-medium">
                <p>{activeLesson.contentBody || 'Document content simulation...'}</p>
              </div>
            )}

            {/* Lesson summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Subject: {activeLesson.subject}</span>
                <Badge variant="default" size="xs">{languageFlags[activeLesson.language]}</Badge>
              </div>
              <p className="text-text-muted leading-relaxed font-medium">{activeLesson.description}</p>
            </div>

            {/* Quiz Section (If available) */}
            {activeLesson.quizQuestions && (
              <div className="border-t border-border/20 pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <HiOutlineSparkles className="w-4 h-4 text-primary-light" />
                  <h4 className="font-heading font-black text-text-primary tracking-tight">Practice Challenge Quiz</h4>
                </div>

                {quizScore === null ? (
                  <form onSubmit={handleQuizSubmit} className="space-y-4">
                    {activeLesson.quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-2">
                        <div className="font-bold text-text-primary">Q{qIdx + 1}: {q.question}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                                selectedAnswers[qIdx] === oIdx
                                  ? 'border-primary bg-primary/8 text-primary-light'
                                  : 'border-border/40 hover:bg-bg-hover/30'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${qIdx}`}
                                checked={selectedAnswers[qIdx] === oIdx}
                                onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                className="sr-only"
                              />
                              <span className="text-[11px] font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <Button variant="primary" size="sm" type="submit">
                        Submit Challenge
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Quiz Score Results view */
                  <div className="p-4 rounded-xl bg-bg-secondary border border-border/15 text-center space-y-3">
                    <div className="text-base font-bold text-text-primary">
                      Challenge Completed!
                    </div>
                    <div className="text-lg font-mono font-black text-primary-light">
                      Score: {quizScore} / {activeLesson.quizQuestions.length}
                    </div>
                    <p className="text-[10px] text-text-dim">
                      {quizScore === activeLesson.quizQuestions.length
                        ? '🏆 Excellent job! Perfect score.'
                        : '📚 Good effort. Review the lesson materials and try again.'}
                    </p>
                    {!isOnline && (
                      <p className="text-[9px] text-warning-light bg-warning/8 border border-warning/15 py-1 px-2.5 rounded-lg inline-block">
                        Saved offline. Sync required when connected.
                      </p>
                    )}
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" size="xs" onClick={() => setQuizScore(null)}>
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border/20 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsViewerOpen(false)}>
                Close Viewer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
