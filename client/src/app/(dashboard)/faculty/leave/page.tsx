'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock as HiOutlinePendingClock,
  HiOutlinePlus
} from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface LeaveRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  proxyFaculty: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
}

export default function FacultyLeave() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    proxyFaculty: '',
  });

  // Query leaves
  const { data: leaves = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['facultyLeaves'],
    queryFn: async () => {
      const res = await api.get('/leaves');
      if (!res.success) throw new Error(res.message || 'Failed to fetch leaves');
      return res.data || [];
    }
  });

  // Add leave mutation
  const applyLeaveMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await api.post('/leaves', body);
      if (!res.success) throw new Error(res.message || 'Submission failed');
      return res.data;
    },
    onSuccess: () => {
      showToast('Leave application submitted successfully!', 'success');
      setIsApplyModalOpen(false);
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
        proxyFaculty: '',
      });
      queryClient.invalidateQueries({ queryKey: ['facultyLeaves'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to submit application.', 'error');
    }
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    applyLeaveMutation.mutate({
      ...formData,
      proxyFaculty: formData.proxyFaculty || 'None Assigned'
    });
  };

  const getStatusBadge = (status: 'Approved' | 'Pending' | 'Rejected') => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="xs" icon={<HiOutlineCheckCircle className="w-3 h-3" />}>Approved</Badge>;
      case 'Pending':
        return <Badge variant="warning" size="xs" icon={<HiOutlinePendingClock className="w-3 h-3" />}>Pending</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="xs" icon={<HiOutlineXCircle className="w-3 h-3" />}>Rejected</Badge>;
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      accessor: (row: LeaveRequest) => (
        <div>
          <div className="text-xs font-bold text-text-primary">{row.leaveType}</div>
          <div className="text-[9px] text-text-dim font-mono">Applied on {row.appliedDate}</div>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessor: (row: LeaveRequest) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <HiOutlineCalendar className="w-3.5 h-3.5 text-text-muted" />
          <span>{row.startDate} to {row.endDate}</span>
        </div>
      ),
    },
    {
      header: 'Proxy Faculty',
      accessor: 'proxyFaculty' as keyof LeaveRequest,
    },
    {
      header: 'Status',
      accessor: (row: LeaveRequest) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: (row: LeaveRequest) => (
        <Button
          variant="outline"
          size="xs"
          onClick={() => {
            setSelectedLeave(row);
            setIsDetailModalOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Stats calculation
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const remainingCasualBalance = 15 - leaves.filter((l) => l.leaveType === 'Casual Leave' && l.status === 'Approved').length;

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading leave application history & balances...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Leave Management</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Apply for casual, sick, or duty leave, allocate proxy coverage, and review requests.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<HiOutlinePlus className="w-4 h-4" />}
          onClick={() => setIsApplyModalOpen(true)}
        >
          Request Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Casual Leave Balance"
          value={`${remainingCasualBalance} / 15`}
          icon={HiOutlineClipboardDocumentList}
          color="primary"
          subtitle="Remaining this academic year"
        />
        <StatCard
          title="Approved Requests"
          value={approvedCount}
          icon={HiOutlineCheckCircle}
          color="success"
          subtitle="Duty/Sick/Casual leaves approved"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          icon={HiOutlinePendingClock}
          color="warning"
          subtitle="Awaiting HOD verification"
        />
      </div>

      {/* Leave History Card */}
      <Card title="Leave Application History" subtitle="Your requested and active leaves">
        <DataTable
          columns={columns}
          data={leaves}
          emptyMessage="No leave records found."
        />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave / Duty"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs text-text-secondary">
          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Leave Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            >
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Duty Leave">Duty Leave (DL)</option>
              <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-text-primary block">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Arrange Proxy Faculty (Optional)</label>
            <select
              value={formData.proxyFaculty}
              onChange={(e) => setFormData({ ...formData, proxyFaculty: e.target.value })}
              className="w-full px-3 py-2 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            >
              <option value="">Select proxy coverage...</option>
              <option value="Dr. Amit Sharma">Dr. Amit Sharma (Operating Systems)</option>
              <option value="Dr. Sunita Verma">Dr. Sunita Verma (Database Systems)</option>
              <option value="Prof. Vikram Malhotra">Prof. Vikram Malhotra (Networks)</option>
            </select>
            <p className="text-[10px] text-text-dim">Selecting a proxy will notify them to accept the class sessions in your absence.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-primary block">Reason / Details</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
              placeholder="Provide a detailed explanation for your leave request..."
              className="w-full p-3 bg-bg-secondary border border-border/40 rounded-xl focus:outline-none focus:border-primary text-text-primary text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/20">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={applyLeaveMutation.isPending}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leave Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{selectedLeave.leaveType}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Applied Date: {selectedLeave.appliedDate}</p>
              </div>
              {getStatusBadge(selectedLeave.status)}
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 py-1 border-b border-border/10">
                <span className="text-text-muted font-medium col-span-1">Duration</span>
                <span className="text-text-primary font-bold col-span-2 font-mono">
                  {selectedLeave.startDate} to {selectedLeave.endDate}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-border/10">
                <span className="text-text-muted font-medium col-span-1">Proxy Cover</span>
                <span className="text-text-primary font-bold col-span-2">
                  {selectedLeave.proxyFaculty}
                </span>
              </div>
              <div className="py-1">
                <span className="text-text-muted font-medium block mb-1">Reason</span>
                <p className="p-3 rounded-xl bg-bg-secondary/60 text-text-primary border border-border/10 leading-relaxed font-medium">
                  {selectedLeave.reason}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/20 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
