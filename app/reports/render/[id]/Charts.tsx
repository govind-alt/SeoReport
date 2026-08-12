"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export function TrafficChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '260px', marginTop: '10px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={15} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-15} width={40} />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="sessions" 
            stroke="#3B82F6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} 
            activeDot={{ r: 6, fill: '#1E40AF' }} 
            isAnimationActive={false} // Disable animation for puppeteer PDF generation
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KeywordChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '260px', marginTop: '10px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 40, left: 20, bottom: 10 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} dx={-15} width={60} />
          <RechartsTooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
