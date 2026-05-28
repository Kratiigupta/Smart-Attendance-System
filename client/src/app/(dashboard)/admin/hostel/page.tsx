'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DonutChart, ChartLegend } from '@/components/charts/Charts';
import {
  HiOutlineBuildingOffice2, HiOutlinePlus, HiOutlineUserGroup,
} from 'react-icons/hi2';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const statusMap: Record<string, { color: string; badge: 'success' | 'primary' | 'warning' | 'danger' | 'default' }> = {
  full: { color: '#ef4444', badge: 'danger' },
  partial: { color: '#f59e0b', badge: 'warning' },
  empty: { color: '#10b981', badge: 'success' },
  maintenance: { color: '#64748b', badge: 'default' },
};

export default function AdminHostelPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBlock, setSelectedBlock] = useState('Block A (Boys)');
  
  // Allocate modal state
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [allocatingRoom, setAllocatingRoom] = useState('');

  // Fetch hostel blocks
  const { data: blocks = [], isLoading: blocksLoading } = useQuery<any[]>({
    queryKey: ['hostelBlocks'],
    queryFn: async () => {
      const res = await api.get('/hostels');
      if (!res.success) throw new Error(res.message || 'Failed to fetch hostel blocks');
      return res.data || [];
    }
  });

  // Fetch rooms for selected block
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<any[]>({
    queryKey: ['hostelRooms', selectedBlock],
    queryFn: async () => {
      const res = await api.get(`/hostels/rooms?blockName=${encodeURIComponent(selectedBlock)}`);
      if (!res.success) throw new Error(res.message || 'Failed to fetch rooms');
      return res.data || [];
    }
  });

  // Allocation mutation
  const allocateMutation = useMutation({
    mutationFn: async (body: { blockName: string; roomName: string; studentName: string }) => {
      const res = await api.post('/hostels/allocate', body);
      if (!res.success) throw new Error(res.message || 'Allocation failed');
      return res.data;
    },
    onSuccess: () => {
      showToast('Room allocated successfully!', 'success');
      setAllocateOpen(false);
      setStudentName('');
      queryClient.invalidateQueries({ queryKey: ['hostelBlocks'] });
      queryClient.invalidateQueries({ queryKey: ['hostelRooms', selectedBlock] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to allocate room.', 'error');
    }
  });

  const handleOpenAllocate = (roomName: string) => {
    const room = rooms.find(r => r.roomName === roomName);
    if (room && (room.status === 'full' || room.status === 'maintenance')) {
      showToast(`Cannot allocate: Room is ${room.status}.`, 'warning');
      return;
    }
    setAllocatingRoom(roomName);
    setAllocateOpen(true);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    allocateMutation.mutate({
      blockName: selectedBlock,
      roomName: allocatingRoom,
      studentName: studentName.trim()
    });
  };

  const totalRooms = blocks.reduce((a, b) => a + b.totalRooms, 0);
  const totalOccupied = blocks.reduce((a, b) => a + b.occupiedRooms, 0);

  // Compute status chart values from fetched rooms
  const occupiedCount = rooms.filter(r => r.status === 'full' || r.status === 'partial').length;
  const emptyCount = rooms.filter(r => r.status === 'empty').length;
  const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;

  const occupancyData = [
    { name: 'Occupied', value: occupiedCount || totalOccupied, color: '#6366f1' },
    { name: 'Available', value: emptyCount || Math.max(0, totalRooms - totalOccupied), color: '#10b981' },
    { name: 'Maintenance', value: maintenanceCount || 0, color: '#f59e0b' },
  ];

  const loading = blocksLoading || roomsLoading;

  if (loading) {
    return (
      <div className="space-y-6 py-12 text-center text-xs text-text-muted animate-pulse">
        🔄 Loading hostel blocks & floor room layout...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-6 h-6 text-primary-light" />
            Hostel Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Room allocation & occupancy tracking</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          icon={<HiOutlinePlus className="w-3.5 h-3.5" />}
          onClick={() => {
            if (rooms.length > 0) {
              const firstAvail = rooms.find(r => r.status === 'empty' || r.status === 'partial');
              if (firstAvail) {
                handleOpenAllocate(firstAvail.roomName);
              } else {
                showToast('No rooms currently available in this block.', 'warning');
              }
            }
          }}
        >
          Allocate Room
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Rooms" value={totalRooms} icon={HiOutlineBuildingOffice2} color="primary" />
        <StatCard title="Occupied Blocks" value={totalOccupied} icon={HiOutlineUserGroup} color="violet" />
        <StatCard title="Available Blocks" value={Math.max(0, totalRooms - totalOccupied)} icon={HiOutlineBuildingOffice2} color="success" />
        <StatCard title="Occupancy Rate" value={totalRooms > 0 ? `${Math.round((totalOccupied / totalRooms) * 100)}%` : '0%'} icon={HiOutlineBuildingOffice2} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Blocks */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-xs font-bold text-text-dim uppercase tracking-wider px-1">Hostel Blocks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blocks.map(block => {
              const pct = (block.occupiedRooms / block.totalRooms) * 100;
              return (
                <Card key={block.name}
                  className={`cursor-pointer transition-all ${selectedBlock === block.name ? 'border-primary/40 bg-primary/5' : 'hover:border-border-light'}`}
                  glow={selectedBlock === block.name}
                  onClick={() => setSelectedBlock(block.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text-primary">{block.name}</span>
                    <Badge variant={block.type === 'Boys' ? 'info' : 'violet'} size="xs">{block.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
                    <span>{block.floors} Floors</span>
                    <span className="font-bold text-text-secondary">{block.occupiedRooms}/{block.totalRooms} rooms occupied</span>
                  </div>
                  <ProgressBar value={block.occupiedRooms} max={block.totalRooms} color={pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'success'} size="sm" />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Occupancy Donut */}
        <Card title="Block Occupancy Status" subtitle="Rooms distribution in current block">
          <DonutChart data={occupancyData} height={200} centerValue={rooms.length > 0 ? `${Math.round((occupiedCount / rooms.length) * 100)}%` : '0%'} centerLabel="Filled" />
          <ChartLegend items={occupancyData.map(d => ({ label: d.name, color: d.color, value: String(d.value) }))} className="mt-3 justify-center" />
        </Card>
      </div>

      {/* Room Grid */}
      <Card title={`Room Layout — ${selectedBlock}`} subtitle="Click a room to allocate occupants">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
          {rooms.map(room => {
            const config = statusMap[room.status];
            return (
              <div
                key={room.roomName}
                onClick={() => handleOpenAllocate(room.roomName)}
                className="rounded-xl border p-3 text-center cursor-pointer transition-all hover:scale-105"
                style={{ borderColor: `${config.color}30`, background: `${config.color}08` }}
              >
                <span className="text-sm font-heading font-black text-text-primary">{room.roomName}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Badge variant={config.badge} size="xs">{room.occupants.length}/{room.capacity}</Badge>
                </div>
                <p className="text-[8px] text-text-dim mt-1 capitalize">{room.status}</p>
                {room.occupants.length > 0 && (
                  <p className="text-[7px] text-text-muted mt-1.5 truncate" title={room.occupants.join(', ')}>
                    {room.occupants.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/15">
          {[
            { label: 'Full', color: '#ef4444' },
            { label: 'Partial', color: '#f59e0b' },
            { label: 'Empty', color: '#10b981' },
            { label: 'Maintenance', color: '#64748b' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              <span className="text-[10px] text-text-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Allocate Room Modal */}
      <Modal
        isOpen={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        title={`Allocate Room ${allocatingRoom} (${selectedBlock})`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAllocateOpen(false)}>Cancel</Button>
            <Button form="allocate-form" type="submit" loading={allocateMutation.isPending}>
              Allocate
            </Button>
          </>
        }
      >
        <form id="allocate-form" onSubmit={handleAllocateSubmit} className="flex flex-col gap-4">
          <Input
            label="Student Name"
            id="studentName"
            placeholder="Enter student full name"
            value={studentName}
            onChange={(e: any) => setStudentName(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
