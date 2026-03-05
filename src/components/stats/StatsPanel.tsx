'use client';

import { formatNumber } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type StatType = 'total' | 'endingSoon' | 'newJobs' | 'institutions';

interface StatsPanelProps {
  totalCount: number;
  endingSoon: number;
  newJobs: number;
  institutions: number;
  activeStatFilter?: StatType | null;
  onStatClick?: (type: StatType) => void;
}

export function StatsPanel({ totalCount, endingSoon, newJobs, institutions, activeStatFilter, onStatClick }: StatsPanelProps) {
  const { t } = useTranslation();

  const stats: { key: StatType; label: string; value: number; suffix: string; subLabel?: string; color: string; desc: string }[] = [
    {
      key: 'total',
      label: t('stats.totalLabel'),
      value: totalCount,
      suffix: t('stats.unitJobs'),
      color: 'from-blue-500 to-blue-600',
      desc: t('stats.totalDesc'),
    },
    {
      key: 'endingSoon',
      label: t('stats.endingSoonLabel'),
      value: endingSoon,
      suffix: t('stats.unitJobs'),
      subLabel: t('stats.endingSoonSub'),
      color: 'from-red-500 to-red-600',
      desc: t('stats.endingSoonDesc'),
    },
    {
      key: 'newJobs',
      label: t('stats.newJobsLabel'),
      value: newJobs,
      suffix: t('stats.unitJobs'),
      subLabel: t('stats.newJobsSub'),
      color: 'from-green-500 to-green-600',
      desc: t('stats.newJobsDesc'),
    },
    {
      key: 'institutions',
      label: t('stats.institutionsLabel'),
      value: institutions,
      suffix: t('stats.unitOrgs'),
      color: 'from-purple-500 to-purple-600',
      desc: t('stats.institutionsDesc'),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isActive = activeStatFilter === stat.key;
        return (
          <button
            key={stat.key}
            onClick={() => onStatClick?.(stat.key)}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg text-left transition-all cursor-pointer hover:scale-[1.03] hover:shadow-xl ${isActive ? 'ring-3 ring-white/60 scale-[1.03]' : ''}`}
          >
            <p className="text-sm opacity-90">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1">
              {formatNumber(stat.value)}
              <span className="text-sm font-normal ml-1">{stat.suffix}</span>
            </p>
            {stat.subLabel && (
              <p className="text-xs opacity-75 mt-1">{stat.subLabel}</p>
            )}
            <p className="text-xs opacity-60 mt-2 border-t border-white/20 pt-2">{stat.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
