'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEye, FaUsers, FaCalendarDay, FaChartLine, FaGlobe,
  FaArrowUp, FaSpinner
} from 'react-icons/fa';

interface VisitorData {
  totalVisits: number;
  uniqueVisitors: string[];
  dailyVisits: Record<string, number>;
  monthlyVisits: Record<string, number>;
  lastVisit: string;
}

export default function AdminVisitorsPage() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch('/api/admin/visitors');
      if (res.ok) {
        const json = await res.json();
        setData(json.visitors);
      }
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="text-primary text-3xl animate-spin" />
      </div>
    );
  }

  const sortedDays = data ? Object.entries(data.dailyVisits).sort(([a], [b]) => a.localeCompare(b)) : [];
  const sortedMonths = data ? Object.entries(data.monthlyVisits).sort(([a], [b]) => a.localeCompare(b)) : [];
  const maxDay = sortedDays.length > 0 ? Math.max(...sortedDays.map(([, v]) => v)) : 1;
  const maxMonth = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(([, v]) => v)) : 1;

  const statsCards = [
    { label: 'Total Visits', value: data?.totalVisits || 0, icon: FaEye, change: '+100%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Unique Visitors', value: data?.uniqueVisitors?.length || 0, icon: FaUsers, change: '+100%', color: 'from-purple-500 to-pink-500' },
    { label: 'Days Active', value: sortedDays.length, icon: FaCalendarDay, change: '', color: 'from-orange-500 to-red-500' },
    { label: 'Avg Daily', value: sortedDays.length > 0 ? Math.round((data?.totalVisits || 0) / sortedDays.length) : 0, icon: FaChartLine, change: '', color: 'from-green-500 to-teal-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Visitor Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {data?.lastVisit ? `Last visit: ${new Date(data.lastVisit).toLocaleString()}` : 'No visits recorded'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white text-lg" />
                </div>
                {stat.change && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                    <FaArrowUp className="text-[9px]" />
                    {stat.change}
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</span>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Daily Visits</h2>
          {sortedDays.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          ) : (
            <div className="h-64 flex items-end gap-1.5">
              {sortedDays.slice(-30).map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-glass border border-glass-border rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
                    {day}: {count} visits
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20 transition-all duration-300 hover:from-primary/80"
                    style={{ height: `${(count / maxDay) * 100}%` }}
                  />
                  {sortedDays.length <= 14 && (
                    <span className="text-[8px] text-gray-600 -rotate-45 origin-left">
                      {day.slice(5)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Monthly Visits</h2>
          {sortedMonths.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          ) : (
            <div className="h-64 flex items-end gap-3">
              {sortedMonths.map(([month, count]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-glass border border-glass-border rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
                    {month}: {count} visits
                  </div>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-secondary/60 to-secondary/20 transition-all duration-300 hover:from-secondary/80"
                    style={{ height: `${(count / maxMonth) * 100}%` }}
                  />
                  <span className="text-[10px] text-gray-600">{month}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
