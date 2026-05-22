'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface UserItem {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'college_admin' | 'hod' | 'faculty' | 'student';
  phone?: string;
  isActive: boolean;
  departmentId?: {
    name: string;
    code: string;
  };
  rollNumber?: string;
  semester?: number;
  employeeId?: string;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  // Create User state
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    phone: '',
    tempPassword: '',
    rollNumber: '',
    semester: '1',
    employeeId: '',
    designation: '',
    departmentId: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      search,
      role: roleFilter
    });
    
    const res = await api.get(`/users?${queryParams.toString()}`);
    setIsLoading(false);

    if (res.success && res.data) {
      setUsers(res.data.users);
      setTotal(res.data.total);
    } else {
      showToast(res.message || 'Failed to fetch users list.', 'error');
    }
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    if (res.success && res.data) {
      setDepartments(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: res.data[0]._id }));
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    const postBody: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone || undefined,
      tempPassword: formData.tempPassword,
      departmentId: formData.departmentId || undefined
    };

    if (formData.role === 'student') {
      postBody.rollNumber = formData.rollNumber;
      postBody.semester = parseInt(formData.semester, 10);
    } else if (formData.role === 'faculty' || formData.role === 'hod') {
      postBody.employeeId = formData.employeeId;
      postBody.designation = formData.designation;
    }

    const res = await api.post('/users/invite', postBody);
    setCreateLoading(false);

    if (res.success) {
      showToast('User onboarded successfully!', 'success');
      setCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'student',
        phone: '',
        tempPassword: '',
        rollNumber: '',
        semester: '1',
        employeeId: '',
        designation: '',
        departmentId: departments[0]?._id || ''
      });
      fetchUsers();
    } else {
      showToast(res.message || 'Failed to onboard user.', 'error');
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user account?')) return;
    const res = await api.delete(`/users/${userId}`);
    if (res.success) {
      showToast('User account deactivated successfully.', 'success');
      fetchUsers();
    } else {
      showToast(res.message || 'Failed to deactivate account.', 'error');
    }
  };

  // Build table columns list
  const columns = [
    {
      header: 'Name',
      accessor: (row: UserItem) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.name}</span>
          <span className="text-xs text-text-muted">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (row: UserItem) => (
        <Badge
          variant={
            row.role === 'college_admin'
              ? 'danger'
              : row.role === 'hod'
              ? 'warning'
              : row.role === 'faculty'
              ? 'info'
              : 'primary'
          }
          size="sm"
        >
          {row.role.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Department / Code',
      accessor: (row: UserItem) => (
        <span className="text-xs font-semibold text-text-secondary">
          {row.departmentId?.name || 'Institutional Wide'}
        </span>
      )
    },
    {
      header: 'Meta ID',
      accessor: (row: UserItem) => (
        <span className="text-xs font-mono text-text-muted">
          {row.rollNumber || row.employeeId || 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row: UserItem) => (
        <Badge variant={row.isActive ? 'success' : 'default'} size="sm" dot={true}>
          {row.isActive ? 'Active' : 'Deactivated'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (row: UserItem) => (
        row.isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeactivate(row._id)}
            className="text-danger hover:bg-danger/10 hover:border-danger/20 border border-transparent px-3 py-1"
          >
            Deactivate
          </Button>
        ) : (
          <span className="text-xs text-text-muted">No Actions</span>
        )
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-text-primary tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Invite, inspect and configure student, faculty, and HOD accounts
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="sm:self-start">
          ➕ Onboard User
        </Button>
      </div>

      {/* Filter Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={roleFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-bg-input border border-border text-xs rounded-xl px-4 py-2.5 text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="college_admin">College Admin</option>
        </select>
      </div>

      {/* Core Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        totalItems={total}
        pageSize={10}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email..."
      />

      {/* Onboard User modal popup */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Onboard Student or Lecturer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button form="create-user-form" type="submit" loading={createLoading}>
              Save User
            </Button>
          </>
        }
      >
        <form id="create-user-form" onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, name: e.target.value }))}
            required
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="rahul@university.edu"
            value={formData.email}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, email: e.target.value }))}
            required
          />

          <Input
            label="Temporary Password"
            id="tempPassword"
            type="password"
            placeholder="Enter temporary signin password"
            value={formData.tempPassword}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, tempPassword: e.target.value }))}
            required
          />

          <Input
            label="Phone Number"
            id="phone"
            placeholder="+91 XXXXXXXXXX"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, phone: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Role Assignment"
              id="role"
              type="select"
              value={formData.role}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, role: e.target.value }))}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'hod', label: 'HOD (Head of Dept)' }
              ]}
              className="col-span-1"
            />

            <Input
              label="Department Allocation"
              id="departmentId"
              type="select"
              value={formData.departmentId}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, departmentId: e.target.value }))}
              options={departments.map(d => ({ value: d._id, label: d.name }))}
              className="col-span-1"
            />
          </div>

          {formData.role === 'student' ? (
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <Input
                label="Roll Number"
                id="rollNumber"
                placeholder="e.g. 2026CSE043"
                value={formData.rollNumber}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, rollNumber: e.target.value }))}
                required
              />
              <Input
                label="Current Semester"
                id="semester"
                type="select"
                value={formData.semester}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, semester: e.target.value }))}
                options={Array.from({ length: 8 }).map((_, i) => ({
                  value: (i + 1).toString(),
                  label: `Semester ${i + 1}`
                }))}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <Input
                label="Employee ID"
                id="employeeId"
                placeholder="e.g. EMP409"
                value={formData.employeeId}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                required
              />
              <Input
                label="Designation Designation"
                id="designation"
                placeholder="e.g. Professor / Asst Professor"
                value={formData.designation}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, designation: e.target.value }))}
                required
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
