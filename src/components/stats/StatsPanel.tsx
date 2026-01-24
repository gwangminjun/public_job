'use client';

import { formatNumber } from '@/lib/utils';

interface StatsPanelProps {
  totalCount: number;
  endingSoon: number;
  newJobs: number;
  institutions: number;
}

export function StatsPanel({ totalCount, endingSoon, newJobs, institutions }: StatsPanelProps) {
  const stats = [
    {
      label: '전체 채용',
      value: totalCount,
      suffix: '건',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '마감 임박',
      value: endingSoon,
      suffix: '건',
      subLabel: '(3일 이내)',
      color: 'from-red-500 to-red-600',
    },
    {
      label: '신규 등록',
      value: newJobs,
      suffix: '건',
      subLabel: '(7일 이내)',
      color: 'from-green-500 to-green-600',
    },
    {
      label: '등록 기관',
      value: institutions,
      suffix: '개',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
        >
          <p className="text-sm opacity-90">{stat.label}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1">
            {formatNumber(stat.value)}
            <span className="text-sm font-normal ml-1">{stat.suffix}</span>
          </p>
          {stat.subLabel && (
            <p className="text-xs opacity-75 mt-1">{stat.subLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
