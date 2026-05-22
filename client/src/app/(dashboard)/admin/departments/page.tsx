'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  hodId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminDepartmentsPage() {
  const { showToast } = useToast();
  
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Create state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hodId: ''
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    const res = await api.get('/departments');
    setIsLoading(false);

    if (res.success && res.data) {
      setDepartments(res.data);
    } else {
      showToast(res.message || 'Failed to fetch departments.', 'error');
    }
  };

  const fetchFaculty = async () => {
    const res = await api.get('/users?role=faculty');
    if (res.success && res.data?.users) {
      setFaculty(res.data.users);
    }
    const resHod = await api.get('/users?role=hod');
    if (resHod.success && resHod.data?.users) {
      setFaculty(prev => [...prev, ...resHod.data.users]);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({ name: '', code: '', hodId: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      hodId: dept.hodId?._id || ''
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    const postBody = {
      name: formData.name,
      code: formData.code,
      hodId: formData.hodId || null
    };

    const res = editId
      ? await api.put(`/departments/${editId}`, postBody)
      : await api.post('/departments', postBody);

    setModalLoading(false);

    if (res.success) {
      showToast(editId ? 'Department updated!' : 'Department created!', 'success');
      setModalOpen(false);
      fetchDepartments();
    } else {
      showToast(res.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department? This will delete all course links.')) return;
    const res = await api.delete(`/departments/${deptId}`);
    if (res.success) {
      showToast('Department deleted successfully.', 'success');
      fetchDepartments();
    } else {
      showToast(res.message || 'Failed to delete department.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-text-primary tracking-tight">
            Departments
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Build and inspect the academic organization layers
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          ➕ Add Department
        </Button>
      </div>

      {/* Grid Departments cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-bg-secondary rounded-2xl" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-text-muted text-sm border border-border">
          No departments configured yet. Click Add Department to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card
              key={dept._id}
              title={dept.name}
              subtitle={`Code: ${dept.code}`}
            >
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Head of Department (HOD)</span>
                  <span className="font-semibold text-text-primary">
                    {dept.hodId?.name || 'Unassigned'}
                  </span>
                </div>
                {dept.hodId?.email && (
                  <div className="text-[10px] text-text-muted text-right font-mono truncate">
                    {dept.hodId.email}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-border/15">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(dept._id)}
                  className="text-danger hover:bg-danger/10 border-transparent"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Popup creation editing */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Department' : 'Create Department'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button form="dept-form" type="submit" loading={modalLoading}>
              Save
            </Button>
          </>
        }
      >
        <form id="dept-form" onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <Input
            label="Department Name"
            id="name"
            placeholder="e.g. Computer Science Engineering"
            value={formData.name}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, name: e.target.value }))}
            required
          />

          <Input
            label="Department Code"
            id="code"
            placeholder="e.g. CSE"
            value={formData.code}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, code: e.target.value }))}
            required
          />

          <Input
            label="Head of Department (HOD)"
            id="hodId"
            type="select"
            value={formData.hodId}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, hodId: e.target.value }))}
            options={[
              { value: '', label: 'Select HOD (Optional)' },
              ...faculty.map((f: any) => ({ value: f.id || f._id, label: f.name }))
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
