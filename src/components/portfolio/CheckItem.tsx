import type { ReactNode } from 'react';

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-1 size-4 shrink-0 text-violet-600"
      >
        <path d="M3 8.5l3 3 7-7" />
      </svg>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}
