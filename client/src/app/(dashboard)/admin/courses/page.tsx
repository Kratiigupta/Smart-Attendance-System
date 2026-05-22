'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface CourseItem {
  _id: string;
  code: string;
  title: string;
  credits: number;
  type: string;
  ltp: {
    lecture: number;
    tutorial: number;
    practical: number;
  };
  semester: number;
  programmeType: string;
  departmentId: {
    _id: string;
    name: string;
    code: string;
  };
}

export default function AdminCoursesPage() {
  const { showToast } = useToast();
  
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    credits: '4',
    type: 'DSC',
    lecture: '3',
    tutorial: '1',
    practical: '0',
    semester: '1',
    programmeType: 'FYUP',
    departmentId: ''
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    const res = await api.get('/courses');
    setIsLoading(false);

    if (res.success && res.data) {
      setCourses(res.data);
    } else {
      showToast(res.message || 'Failed to fetch courses.', 'error');
    }
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    if (res.success && res.data) {
      setDepartments(res.data);
      if (res.data.length > 0) {
        setFormData((prev) => ({ ...prev, departmentId: res.data[0]._id }));
      }
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      code: '',
      title: '',
      credits: '4',
      type: 'DSC',
      lecture: '3',
      tutorial: '1',
      practical: '0',
      semester: '1',
      programmeType: 'FYUP',
      departmentId: departments[0]?._id || ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course: CourseItem) => {
    setEditId(course._id);
    setFormData({
      code: course.code,
      title: course.title,
      credits: course.credits.toString(),
      type: course.type,
      lecture: course.ltp.lecture.toString(),
      tutorial: course.ltp.tutorial.toString(),
      practical: course.ltp.practical.toString(),
      semester: course.semester.toString(),
      programmeType: course.programmeType,
      departmentId: course.departmentId._id
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    const postBody = {
      code: formData.code,
      title: formData.title,
      credits: parseInt(formData.credits, 10),
      type: formData.type,
      ltp: {
        lecture: parseInt(formData.lecture, 10),
        tutorial: parseInt(formData.tutorial, 10),
        practical: parseInt(formData.practical, 10)
      },
      semester: parseInt(formData.semester, 10),
      programmeType: formData.programmeType,
      departmentId: formData.departmentId
    };

    const res = editId
      ? await api.put(`/courses/${editId}`, postBody)
      : await api.post('/courses', postBody);

    setModalLoading(false);

    if (res.success) {
      showToast(editId ? 'Course updated successfully!' : 'Course created successfully!', 'success');
      setModalOpen(false);
      fetchCourses();
    } else {
      showToast(res.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const res = await api.delete(`/courses/${courseId}`);
    if (res.success) {
      showToast('Course deleted successfully.', 'success');
      fetchCourses();
    } else {
      showToast(res.message || 'Failed to delete course.', 'error');
    }
  };

  // Table Columns
  const columns = [
    {
      header: 'Course Code',
      accessor: (row: CourseItem) => (
        <span className="font-mono text-xs bg-bg-hover border border-border px-2 py-1 rounded font-bold">
          {row.code}
        </span>
      )
    },
    {
      header: 'Title',
      accessor: (row: CourseItem) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.title}</span>
          <span className="text-[10px] text-text-muted">Dept: {row.departmentId?.name || 'Wide'}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: (row: CourseItem) => (
        <Badge variant="primary" size="sm">
          {row.type}
        </Badge>
      )
    },
    {
      header: 'L-T-P Pattern',
      accessor: (row: CourseItem) => (
        <span className="text-xs font-semibold text-text-secondary">
          {row.ltp.lecture}-{row.ltp.tutorial}-{row.ltp.practical}
        </span>
      )
    },
    {
      header: 'Credits',
      accessor: (row: CourseItem) => (
        <span className="font-bold font-heading text-primary-light">
          {row.credits} Credits
        </span>
      )
    },
    {
      header: 'Semester',
      accessor: (row: CourseItem) => (
        <span className="text-xs text-text-muted">Semester {row.semester}</span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: CourseItem) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row)} className="px-3 py-1">
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row._id)}
            className="text-danger hover:bg-danger/10 border-transparent px-3 py-1"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-text-primary tracking-tight">
            NEP Course Catalog
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Configure FYUP (Four Year Undergraduate Programme) / ITEP syllabus structures
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          ➕ Add Course
        </Button>
      </div>

      {/* Grid table representation */}
      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        totalItems={courses.length}
        pageSize={100} // Large client-side view
      />

      {/* Modal Popup creation editing */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Course Syllabus' : 'Add Course'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button form="course-form" type="submit" loading={modalLoading}>
              Save Course
            </Button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              id="code"
              placeholder="e.g. CSC-01"
              value={formData.code}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, code: e.target.value }))}
              required
            />
            <Input
              label="Department"
              id="departmentId"
              type="select"
              value={formData.departmentId}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, departmentId: e.target.value }))}
              options={departments.map(d => ({ value: d._id, label: d.name }))}
            />
          </div>

          <Input
            label="Course Title"
            id="title"
            placeholder="e.g. Data Structures & Algorithms"
            value={formData.title}
            onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-3 gap-3 border-b border-border pb-3">
            <Input
              label="Credits Allocation"
              id="credits"
              type="number"
              min="1"
              max="12"
              value={formData.credits}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, credits: e.target.value }))}
              required
            />

            <Input
              label="Course Category"
              id="type"
              type="select"
              value={formData.type}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, type: e.target.value }))}
              options={[
                { value: 'DSC', label: 'DSC (Discipline Core)' },
                { value: 'Minor', label: 'Minor Elective' },
                { value: 'MDC', label: 'MDC (Multi-Disciplinary)' },
                { value: 'AEC', label: 'AEC (Ability Enhancement)' },
                { value: 'SEC', label: 'SEC (Skill Enhancement)' },
                { value: 'VAC', label: 'VAC (Value Added Course)' },
                { value: 'Research', label: 'Research Project' },
                { value: 'Internship', label: 'Vocational Internship' }
              ]}
              className="col-span-2"
            />
          </div>

          {/* LTP Breakdown */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-text-secondary">
              L-T-P Configuration (Lecture - Tutorial - Practical hours/week)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Lecture (L)"
                id="lecture"
                type="number"
                min="0"
                value={formData.lecture}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, lecture: e.target.value }))}
              />
              <Input
                label="Tutorial (T)"
                id="tutorial"
                type="number"
                min="0"
                value={formData.tutorial}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, tutorial: e.target.value }))}
              />
              <Input
                label="Practical (P)"
                id="practical"
                type="number"
                min="0"
                value={formData.practical}
                onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, practical: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <Input
              label="Recommended Semester"
              id="semester"
              type="select"
              value={formData.semester}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, semester: e.target.value }))}
              options={Array.from({ length: 8 }).map((_, i) => ({
                value: (i + 1).toString(),
                label: `Semester ${i + 1}`
              }))}
            />

            <Input
              label="Programme Stream"
              id="programmeType"
              type="select"
              value={formData.programmeType}
              onChange={(e: React.ChangeEvent<any>) => setFormData(p => ({ ...p, programmeType: e.target.value }))}
              options={[
                { value: 'FYUP', label: 'FYUP (Four Year UG)' },
                { value: 'ITEP', label: 'ITEP (Teacher Education)' },
                { value: 'PG', label: 'PG (Post Graduate)' }
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
