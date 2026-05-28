'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  HiOutlineDocumentText, HiOutlinePlus, HiOutlineEye,
  HiOutlineCheck, HiOutlineXMark, HiOutlineClock,
  HiOutlineUserPlus, HiOutlineMagnifyingGlass, HiOutlineArrowUpTray
} from 'react-icons/hi2';

import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const statusConfig: Record<string, { badge: 'info' | 'warning' | 'success' | 'primary' | 'danger'; icon: string }> = {
  applied: { badge: 'info', icon: '📝' },
  reviewing: { badge: 'warning', icon: '🔍' },
  accepted: { badge: 'success', icon: '✅' },
  enrolled: { badge: 'primary', icon: '🎓' },
  rejected: { badge: 'danger', icon: '❌' },
};

const stages = ['applied', 'reviewing', 'accepted', 'enrolled'];

export default function AdminAdmissionsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading } = useQuery<any[]>({
    queryKey: ['admissionsList'],
    queryFn: async () => {
      const res = await api.get('/admissions');
      if (!res.success) throw new Error(res.message || 'Failed to fetch admissions');
      return res.data || [];
    }
  });

  const createAdmissionMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; programme: string; marks: string }) => {
      const res = await api.post('/admissions', payload);
      if (!res.success) throw new Error(res.message || 'Failed to submit application');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionsList'] });
      showToast('New candidate application registered in ERP pipeline.', 'success');
      setIsModalOpen(false);
      // Reset form states
      setForm({ name: '', email: '', programme: 'B.Tech CSE (FYUP)', marks: '' });
      setMarksheetUploaded(false);
      setPhotoUploaded(false);
      setMarksheetProgress(0);
      setPhotoProgress(0);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to submit application', 'error');
    }
  });

  // New Application Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    programme: 'B.Tech CSE (FYUP)',
    marks: '',
  });

  // Simulated document uploads
  const [marksheetUploaded, setMarksheetUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadingMarksheet, setUploadingMarksheet] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [marksheetProgress, setMarksheetProgress] = useState(0);
  const [photoProgress, setPhotoProgress] = useState(0);

  const handleUploadMarksheet = () => {
    setUploadingMarksheet(true);
    setMarksheetProgress(0);
    const interval = setInterval(() => {
      setMarksheetProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingMarksheet(false);
          setMarksheetUploaded(true);
          showToast('Marksheet.pdf uploaded successfully for validation.', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  const handleUploadPhoto = () => {
    setUploadingPhoto(true);
    setPhotoProgress(0);
    const interval = setInterval(() => {
      setPhotoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingPhoto(false);
          setPhotoUploaded(true);
          showToast('PassportPhoto.jpg uploaded successfully.', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksheetUploaded || !photoUploaded) {
      showToast('Please upload all required registration documents.', 'warning');
      return;
    }

    createAdmissionMutation.mutate({
      name: form.name,
      email: form.email,
      programme: form.programme,
      marks: form.marks,
    });
  };

  // Filters application list based on search and status selects
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.programme.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesStatus = selectedStatusFilter === 'All' || app.status === selectedStatusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading ERP admission applications & pipelines...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineDocumentText className="w-6 h-6 text-primary-light" />
            Admissions
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Application pipeline & enrollment management</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          icon={<HiOutlinePlus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Application
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Applied" value={apps.length} icon={HiOutlineDocumentText} color="cyan" trend={{ value: 24, isUp: true }} />
        <StatCard title="Under Review" value={apps.filter(a => a.status === 'reviewing').length} icon={HiOutlineClock} color="warning" />
        <StatCard title="Accepted" value={apps.filter(a => a.status === 'accepted').length} icon={HiOutlineCheck} color="success" />
        <StatCard title="Enrolled" value={apps.filter(a => a.status === 'enrolled').length} icon={HiOutlineUserPlus} color="primary" subtitle="2026-27 Batch" />
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-secondary p-4 rounded-2xl border border-border/40">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-bg-elevated border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary placeholder:text-text-dim transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status:</span>
          <div className="flex bg-bg-elevated border border-border/40 p-0.5 rounded-xl">
            {['All', 'Applied', 'Reviewing', 'Accepted', 'Enrolled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                  selectedStatusFilter === status
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <Tabs
        tabs={[
          { id: 'pipeline', label: 'Pipeline View' },
          { id: 'list', label: 'All Applications', badge: String(filteredApps.length) },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Active Tab rendering */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map(stage => {
            const stageApps = filteredApps.filter(a => a.status === stage);
            const config = statusConfig[stage];
            return (
              <div key={stage} className="space-y-3 bg-bg-secondary/20 p-2.5 rounded-2xl border border-border/10">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="text-xs font-bold text-text-primary capitalize">{stage}</span>
                  </div>
                  <Badge variant={config.badge} size="xs">{stageApps.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageApps.length > 0 ? stageApps.map(app => (
                    <Card key={app.id} className="!p-3 cursor-pointer hover:border-primary/35 hover:scale-[1.01] transition-all">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-text-primary truncate">{app.name}</p>
                          <p className="text-[9px] text-text-muted">{app.email}</p>
                        </div>
                      </div>
                      <Badge variant="default" size="xs" className="mb-1.5">{app.programme}</Badge>
                      <div className="flex items-center justify-between text-[9px] text-text-dim">
                        <span>📊 {app.marks}</span>
                        <span>{app.date}</span>
                      </div>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-[10px] text-text-dim border border-dashed border-border/20 rounded-xl">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'list' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {['Applicant', 'Programme', 'Marks', 'Applied', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/15">
                {filteredApps.length > 0 ? filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-bg-hover/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold">{app.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{app.name}</p>
                          <p className="text-[9px] text-text-muted">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-text-secondary">{app.programme}</td>
                    <td className="px-5 py-3 text-[11px] font-bold text-text-primary">{app.marks}</td>
                    <td className="px-5 py-3 text-[10px] text-text-muted">{app.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusConfig[app.status]?.badge || 'default'} size="xs">
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3"><Button variant="ghost" size="xs" icon={<HiOutlineEye className="w-3.5 h-3.5" />}>View</Button></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-xs text-text-dim">
                      No matching candidate records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* New Application Student Registration Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Registration & Admission Form"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-text-secondary">
          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Candidate Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. rahul@email.com"
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Target Programme</label>
              <select
                value={form.programme}
                onChange={(e) => setForm({ ...form, programme: e.target.value })}
                className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs cursor-pointer"
              >
                <option value="B.Tech CSE (FYUP)">B.Tech CSE (FYUP)</option>
                <option value="B.Tech ECE (FYUP)">B.Tech ECE (FYUP)</option>
                <option value="B.Tech ME (FYUP)">B.Tech ME (FYUP)</option>
                <option value="B.Ed. (ITEP)">B.Ed. (ITEP)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">12th Marks (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.1"
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                placeholder="e.g. 88.5"
                className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
              />
            </div>
          </div>

          {/* Document Upload Roster */}
          <div className="border-t border-border/20 pt-4 space-y-3">
            <h4 className="font-bold text-text-primary block">Upload Verification Documents</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Marksheet Upload card */}
              <div className="p-3 border border-dashed border-border/50 bg-bg-secondary/40 rounded-xl flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[10px] text-text-primary">12th Class Marksheet</span>
                  {marksheetUploaded && <Badge variant="success" size="xs">Uploaded</Badge>}
                </div>
                {uploadingMarksheet ? (
                  <ProgressBar value={marksheetProgress} max={100} size="xs" showLabel color="primary" />
                ) : !marksheetUploaded ? (
                  <Button
                    variant="outline"
                    size="xs"
                    type="button"
                    icon={<HiOutlineArrowUpTray className="w-3 h-3" />}
                    onClick={handleUploadMarksheet}
                  >
                    Select File
                  </Button>
                ) : (
                  <span className="text-[9px] text-text-muted italic truncate">Marksheet.pdf (3.2 MB)</span>
                )}
              </div>

              {/* Photo Upload card */}
              <div className="p-3 border border-dashed border-border/50 bg-bg-secondary/40 rounded-xl flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[10px] text-text-primary">Passport Photo</span>
                  {photoUploaded && <Badge variant="success" size="xs">Uploaded</Badge>}
                </div>
                {uploadingPhoto ? (
                  <ProgressBar value={photoProgress} max={100} size="xs" showLabel color="primary" />
                ) : !photoUploaded ? (
                  <Button
                    variant="outline"
                    size="xs"
                    type="button"
                    icon={<HiOutlineArrowUpTray className="w-3 h-3" />}
                    onClick={handleUploadPhoto}
                  >
                    Select File
                  </Button>
                ) : (
                  <span className="text-[9px] text-text-muted italic truncate">PassportPhoto.jpg (800 KB)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/20">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
