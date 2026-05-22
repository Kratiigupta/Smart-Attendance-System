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

const blocks = [
  { name: 'Block A (Boys)', total: 50, occupied: 42, type: 'Boys', floors: 4 },
  { name: 'Block B (Boys)', total: 60, occupied: 55, type: 'Boys', floors: 5 },
  { name: 'Block C (Girls)', total: 40, occupied: 38, type: 'Girls', floors: 4 },
  { name: 'Block D (Girls)', total: 45, occupied: 40, type: 'Girls', floors: 4 },
];

const floorData = [
  { room: 'A-101', floor: 'Ground', capacity: 3, occupants: ['Amit Kumar', 'Rahul Singh', 'Vikash Yadav'], status: 'full' },
  { room: 'A-102', floor: 'Ground', capacity: 3, occupants: ['Deepak Verma', 'Sandeep Singh'], status: 'partial' },
  { room: 'A-103', floor: 'Ground', capacity: 3, occupants: [], status: 'empty' },
  { room: 'A-104', floor: 'Ground', capacity: 2, occupants: ['Ravi Kumar', 'Mohit Yadav'], status: 'full' },
  { room: 'A-105', floor: 'Ground', capacity: 2, occupants: ['Gaurav Sharma'], status: 'partial' },
  { room: 'A-106', floor: 'Ground', capacity: 3, occupants: [], status: 'maintenance' },
];

const occupancyData = [
  { name: 'Occupied', value: 175, color: '#6366f1' },
  { name: 'Available', value: 20, color: '#10b981' },
  { name: 'Maintenance', value: 5, color: '#f59e0b' },
];

const statusMap: Record<string, { color: string; badge: 'success' | 'primary' | 'warning' | 'danger' | 'default' }> = {
  full: { color: '#ef4444', badge: 'danger' },
  partial: { color: '#f59e0b', badge: 'warning' },
  empty: { color: '#10b981', badge: 'success' },
  maintenance: { color: '#64748b', badge: 'default' },
};

export default function AdminHostelPage() {
  const [selectedBlock, setSelectedBlock] = useState('Block A (Boys)');
  const totalRooms = blocks.reduce((a, b) => a + b.total, 0);
  const totalOccupied = blocks.reduce((a, b) => a + b.occupied, 0);

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
        <Button variant="primary" size="sm" icon={<HiOutlinePlus className="w-3.5 h-3.5" />}>Allocate Room</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Rooms" value={totalRooms} icon={HiOutlineBuildingOffice2} color="primary" />
        <StatCard title="Occupied" value={totalOccupied} icon={HiOutlineUserGroup} color="violet" />
        <StatCard title="Available" value={totalRooms - totalOccupied} icon={HiOutlineBuildingOffice2} color="success" />
        <StatCard title="Occupancy Rate" value={`${Math.round((totalOccupied / totalRooms) * 100)}%`} icon={HiOutlineBuildingOffice2} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Blocks */}
        <div className="space-y-3 lg:col-span-2">
          <h3 className="text-xs font-bold text-text-dim uppercase tracking-wider px-1">Hostel Blocks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blocks.map(block => {
              const pct = (block.occupied / block.total) * 100;
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
                    <span className="font-bold text-text-secondary">{block.occupied}/{block.total} rooms</span>
                  </div>
                  <ProgressBar value={block.occupied} max={block.total} color={pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'success'} size="sm" />
                </Card>
              );
            })}
          </div>
        </div>

        {/* Occupancy Donut */}
        <Card title="Overall Occupancy" subtitle="All hostels combined">
          <DonutChart data={occupancyData} height={200} centerValue={`${Math.round((totalOccupied / totalRooms) * 100)}%`} centerLabel="Filled" />
          <ChartLegend items={occupancyData.map(d => ({ label: d.name, color: d.color, value: String(d.value) }))} className="mt-3 justify-center" />
        </Card>
      </div>

      {/* Room Grid */}
      <Card title={`Room Layout — ${selectedBlock}`} subtitle="Click room to manage allocation">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
          {floorData.map(room => {
            const config = statusMap[room.status];
            return (
              <div
                key={room.room}
                className="rounded-xl border p-3 text-center cursor-pointer transition-all hover:scale-105"
                style={{ borderColor: `${config.color}30`, background: `${config.color}08` }}
              >
                <span className="text-sm font-heading font-black text-text-primary">{room.room}</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Badge variant={config.badge} size="xs">{room.occupants.length}/{room.capacity}</Badge>
                </div>
                <p className="text-[8px] text-text-dim mt-1 capitalize">{room.status}</p>
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
    </div>
  );
}
