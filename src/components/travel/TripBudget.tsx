'use client';

import { useMemo, useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useTravelStore } from '@/store/travelStore';
import { Trip, ExpenseCategory, EXPENSE_CATEGORIES } from '@/lib/travel/types';

function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function TripBudget({ trip }: { trip: Trip }) {
  const addExpense = useTravelStore((s) => s.addExpense);
  const deleteExpense = useTravelStore((s) => s.deleteExpense);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');

  const total = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const tripDays =
    differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
  const perDay = Math.round(total / tripDays);

  const byCategory = useMemo(() => {
    return (Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[])
      .map((key) => ({
        key,
        ...EXPENSE_CATEGORIES[key],
        sum: trip.expenses.filter((e) => e.category === key).reduce((s, e) => s + e.amount, 0),
      }))
      .filter((c) => c.sum > 0)
      .sort((a, b) => b.sum - a.sum);
  }, [trip.expenses]);

  const parsedAmount = Number(amount.replace(/[,\s]/g, ''));
  const canSubmit = title.trim() && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addExpense(trip.id, { title: title.trim(), amount: parsedAmount, category });
    setTitle('');
    setAmount('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">총 지출</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatKrw(total)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">하루 평균 ({tripDays}일)</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatKrw(perDay)}</p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm space-y-3">
          {byCategory.map((c) => (
            <div key={c.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">
                  {c.emoji} {c.label}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatKrw(c.sum)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${Math.round((c.sum / total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        >
          {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((key) => (
            <option key={key} value={key}>
              {EXPENSE_CATEGORIES[key].emoji} {EXPENSE_CATEGORIES[key].label}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="지출 내역"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액 (원)"
          inputMode="numeric"
          className="w-full sm:w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          추가
        </button>
      </form>

      {trip.expenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40 py-12 text-center">
          <p className="text-3xl mb-2">💳</p>
          <p className="text-sm text-slate-400">아직 기록된 지출이 없어요.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
          {trip.expenses.map((expense) => (
            <li key={expense.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-xl">{EXPENSE_CATEGORIES[expense.category].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{expense.title}</p>
                <p className="text-xs text-slate-400">{EXPENSE_CATEGORIES[expense.category].label}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                {formatKrw(expense.amount)}
              </span>
              <button
                onClick={() => deleteExpense(trip.id, expense.id)}
                className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors"
                aria-label="삭제"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
