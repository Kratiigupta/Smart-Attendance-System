'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HiOutlineHomeModern, HiOutlinePlus, HiOutlineWifi, HiOutlineSignal } from 'react-icons/hi2';

const rooms = [
  { id: 1, name: 'LH-101', building: 'Main Block', floor: 'Ground', capacity: 60, type: 'Lecture Hall', status: 'occupied', currentClass: 'Eng. Math III', occupancy: 55, hasWifi: true, hasProjector: true },
  { id: 2, name: 'LH-102', building: 'Main Block', floor: 'Ground', capacity: 60, type: 'Lecture Hall', status: 'available', currentClass: null, occupancy: 0, hasWifi: true, hasProjector: true },
  { id: 3, name: 'LH-201', building: 'Main Block', floor: '1st', capacity: 80, type: 'Lecture Hall', status: 'occupied', currentClass: 'Digital Electronics', occupancy: 42, hasWifi: true, hasProjector: true },
  { id: 4, name: 'LH-301', building: 'Main Block', floor: '2nd', capacity: 50, type: 'Lecture Hall', status: 'occupied', currentClass: 'Data Structures', occupancy: 45, hasWifi: true, hasProjector: true },
  { id: 5, name: 'LH-401', building: 'Science Block', floor: '3rd', capacity: 50, type: 'Lecture Hall', status: 'maintenance', currentClass: null, occupancy: 0, hasWifi: false, hasProjector: true },
  { id: 6, name: 'Lab-101', building: 'CS Block', floor: 'Ground', capacity: 40, type: 'Computer Lab', status: 'available', currentClass: null, occupancy: 0, hasWifi: true, hasProjector: true },
  { id: 7, name: 'Lab-201', building: 'CS Block', floor: '1st', capacity: 35, type: 'Computer Lab', status: 'occupied', currentClass: 'Web Dev Lab', occupancy: 32, hasWifi: true, hasProjector: false },
  { id: 8, name: 'Lab-301', building: 'ECE Block', floor: '2nd', capacity: 30, type: 'Electronics Lab', status: 'available', currentClass: null, occupancy: 0, hasWifi: true, hasProjector: false },
  { id: 9, name: 'Seminar Hall', building: 'Admin Block', floor: '1st', capacity: 200, type: 'Seminar Hall', status: 'available', currentClass: null, occupancy: 0, hasWifi: true, hasProjector: true },
];

const statusColors: Record<string, { badge: 'success' | 'danger' | 'warning' | 'default'; dot: string }> = {
  available: { badge: 'success', dot: 'bg-success' },
  occupied: { badge: 'danger', dot: 'bg-danger' },
  maintenance: { badge: 'warning', dot: 'bg-warning' },
};

export default function AdminRoomsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

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
        <Button variant="primary" size="sm" icon={<HiOutlinePlus className="w-3.5 h-3.5" />}>Add Room</Button>
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
          <Card key={room.id} className="group hover:border-border-light">
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
    </div>
  );
}
