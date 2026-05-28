'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HiOutlineClipboardDocumentList, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Assignment {
  id: number;
  course: string;
  code: string;
  title: string;
  due: string;
  status: 'pending' | 'submitted' | 'graded';
  points: string;
  grade?: string;
}

export default function StudentAssignmentsPage() {
  const { showToast } = useToast();

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ['studentAssignments'],
    queryFn: async () => {
      const res = await api.get('/assignments');
      if (!res.success) throw new Error(res.message || 'Failed to fetch assignments');
      return res.data || [];
    }
  });

  const handleUploadWork = (title: string) => {
    showToast(`Upload portal for "${title}" will be available soon.`, 'info');
  };

  const handleViewSubmission = (title: string) => {
    showToast(`Viewing submission for "${title}".`, 'info');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-bg-secondary animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-bg-secondary animate-pulse rounded-lg" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">
          Assignments & Homework
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Submit and track your academic worksheets.
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center">
              <HiOutlineClipboardDocumentList className="w-8 h-8 text-violet-light" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">No Assignments Yet</h3>
            <p className="text-xs text-text-muted max-w-xs">
              No assignments have been posted for your enrolled courses yet. Check back later.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((a) => (
            <Card key={a.id} className="hover:border-border-light transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet-light shrink-0 mt-0.5">
                    <HiOutlineClipboardDocumentList className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-text-primary">{a.title}</h3>
                      <Badge
                        variant={
                          a.status === 'graded' ? 'success' :
                          a.status === 'submitted' ? 'primary' : 'warning'
                        }
                        size="xs"
                      >
                        {a.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                      {a.course} ({a.code}) • Due: {a.due} • Points: {a.points}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {a.status === 'graded' && (
                    <span className="text-xs font-black text-success-light mr-2">Grade: {a.grade}</span>
                  )}
                  {a.status === 'pending' ? (
                    <Button variant="primary" size="xs" icon={<HiOutlineArrowUpTray className="w-3.5 h-3.5" />} onClick={() => handleUploadWork(a.title)}>
                      Upload Work
                    </Button>
                  ) : (
                    <Button variant="outline" size="xs" onClick={() => handleViewSubmission(a.title)}>
                      View Submission
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
