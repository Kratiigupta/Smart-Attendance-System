'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { HiOutlineHomeModern, HiOutlinePlus, HiOutlineWifi, HiOutlineSignal } from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

const statusColors: Record<string, { badge: 'success' | 'danger' | 'warning' | 'default'; dot: string }> = {
  available: { badge: 'success', dot: 'bg-success' },
  occupied: { badge: 'danger', dot: 'bg-danger' },
  maintenance: { badge: 'warning', dot: 'bg-warning' },
};

export default function AdminRoomsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  
  // Add room form state
  const [formData, setFormData] = useState({
    name: '',
    building: 'Main Block',
    floor: 'Ground',
    capacity: '60',
    type: 'Lecture Hall',
    hasWifi: true,
    hasProjector: true
  });

  // Query rooms
  const { data: rooms = [], isLoading } = useQuery<any[]>({
    queryKey: ['adminRooms'],
    queryFn: async () => {
      const res = await api.get('/rooms');
      if (!res.success) throw new Error(res.message || 'Failed to fetch rooms');
      return res.data || [];
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await api.post('/rooms', body);
      if (!res.success) throw new Error(res.message || 'Creation failed');
      return res.data;
    },
    onSuccess: () => {
      showToast('Room created successfully!', 'success');
      setAddOpen(false);
      setFormData({
        name: '',
        building: 'Main Block',
        floor: 'Ground',
        capacity: '60',
        type: 'Lecture Hall',
        hasWifi: true,
        hasProjector: true
      });
      queryClient.invalidateQueries({ queryKey: ['adminRooms'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create room.', 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addRoomMutation.mutate({
      ...formData,
      capacity: parseInt(formData.capacity, 10),
      status: 'available',
      occupancy: 0
    });
  };

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  if (isLoading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading classrooms, labs & seminar halls...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineHomeModern className="w-6 h-6 text-primary-light" />
            Room Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Classroom, lab & seminar hall management</p>
        </div>
        <Button variant="primary" size="sm" icon={<HiOutlinePlus className="w-3.5 h-3.5" />} onClick={() => setAddOpen(true)}>
          Add Room
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Rooms" value={rooms.length} icon={HiOutlineHomeModern} color="primary" />
        <StatCard title="Available" value={rooms.filter(r => r.status === 'available').length} icon={HiOutlineHomeModern} color="success" />
        <StatCard title="Occupied" value={rooms.filter(r => r.status === 'occupied').length} icon={HiOutlineHomeModern} color="danger" />
        <StatCard title="Wi-Fi Enabled" value={rooms.filter(r => r.hasWifi).length} icon={HiOutlineWifi} color="secondary" />
      </div>

      <div className="flex items-center gap-2">
        {['all', 'available', 'occupied', 'maintenance'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer
              ${filter === f ? 'bg-primary/12 text-primary-light border-primary/25' : 'bg-transparent text-text-muted border-border/30 hover:bg-bg-hover'}`}
          >{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map(room => (
          <Card key={room._id} className="group hover:border-border-light">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-heading font-black text-text-primary">{room.name}</span>
                  <Badge variant={statusColors[room.status].badge} size="xs" dot pulse={room.status === 'occupied'}>
                    {room.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">{room.building} • {room.floor} Floor • {room.type}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-heading font-black text-text-primary">{room.capacity}</span>
                <p className="text-[9px] text-text-dim">seats</p>
              </div>
            </div>

            {room.currentClass && (
              <div className="bg-bg-elevated/50 rounded-lg p-2.5 mb-3 border border-border/20">
                <span className="text-[10px] text-text-muted">Current Class:</span>
                <p className="text-xs font-bold text-primary-light">{room.currentClass}</p>
                <ProgressBar value={room.occupancy} max={room.capacity} color="primary" size="xs" showLabel className="mt-1.5" />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border/15">
              {room.hasWifi && <Badge variant="secondary" size="xs"><HiOutlineWifi className="w-3 h-3 inline mr-1" />Wi-Fi</Badge>}
              {room.hasProjector && <Badge variant="violet" size="xs">📽️ Projector</Badge>}
              <Badge variant="default" size="xs"><HiOutlineSignal className="w-3 h-3 inline mr-1" />BLE</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Academic Room"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button form="add-room-form" type="submit" loading={addRoomMutation.isPending}>
              Create Room
            </Button>
          </>
        }
      >
        <form id="add-room-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Room Name"
            id="name"
            placeholder="e.g. LH-103, Lab-402"
            value={formData.name}
            onChange={(e: any) => setFormData(p => ({ ...p, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Building"
              id="building"
              value={formData.building}
              onChange={(e: any) => setFormData(p => ({ ...p, building: e.target.value }))}
              required
            />
            <Input
              label="Floor"
              id="floor"
              placeholder="e.g. Ground, 1st"
              value={formData.floor}
              onChange={(e: any) => setFormData(p => ({ ...p, floor: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Seat Capacity"
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e: any) => setFormData(p => ({ ...p, capacity: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-bg-input border border-border/40 rounded-xl text-xs font-semibold text-text-secondary px-3 py-2.5 focus:border-primary/45 focus:outline-none"
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Computer Lab">Computer Lab</option>
                <option value="Electronics Lab">Electronics Lab</option>
                <option value="Seminar Hall">Seminar Hall</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6 border-t border-border pt-4 mt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasWifi}
                onChange={(e) => setFormData(p => ({ ...p, hasWifi: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input"
              />
              <span>Wi-Fi Enabled</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasProjector}
                onChange={(e) => setFormData(p => ({ ...p, hasProjector: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer bg-bg-input"
              />
              <span>Projector Configured</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
