'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const PRIMARY_LINKS = [
  { href: '/grandma', label: '홈', emoji: '🏠' },
  { href: '/grandma/timeline', label: '발자취', emoji: '📖' },
  { href: '/grandma/gallery', label: '사진첩', emoji: '📷' },
  { href: '/grandma/guestbook', label: '방명록', emoji: '✉️' },
  { href: '/grandma/video', label: '영상', emoji: '🎬' },
];

const EXTRA_LINKS = [{ href: '/grandma/admin', label: '관리', emoji: '🛠️' }];

function isActive(pathname: string, href: string) {
  return href === '/grandma' ? pathname === href : pathname.startsWith(href);
}

export function GrandmaNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden md:flex items-center gap-1">
        {[...PRIMARY_LINKS, ...EXTRA_LINKS].map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: 'rgba(255,255,255,0.16)', color: 'white' }
                  : { color: '#FDE68A' }
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border"
        style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'white', backgroundColor: 'rgba(255,255,255,0.08)' }}
        aria-label="메뉴 열기"
        aria-expanded={open}
      >
        {open ? '×' : '☰'}
      </button>

      {open && (
        <div className="md:hidden absolute left-4 right-4 top-full mt-2 rounded-3xl border shadow-xl p-3 z-20" style={{ backgroundColor: '#FFF8EE', borderColor: '#C49A6C' }}>
          <div className="grid grid-cols-2 gap-2">
            {[...PRIMARY_LINKS, ...EXTRA_LINKS].map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-3 text-sm font-semibold border transition-colors"
                  style={
                    active
                      ? { backgroundColor: '#7B4F2E', borderColor: '#7B4F2E', color: 'white' }
                      : { backgroundColor: '#FFFAF3', borderColor: '#E8C99A', color: '#7B4F2E' }
                  }
                >
                  <span className="mr-2">{link.emoji}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 rounded-3xl border shadow-xl px-2 py-2" style={{ backgroundColor: 'rgba(255,250,243,0.96)', borderColor: '#E8C99A', backdropFilter: 'blur(12px)' }}>
        <div className="grid grid-cols-5 gap-1">
          {PRIMARY_LINKS.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center rounded-2xl py-2 text-[11px] font-semibold transition-colors"
                style={
                  active
                    ? { backgroundColor: '#7B4F2E', color: 'white' }
                    : { color: '#7B4F2E' }
                }
              >
                <span className="text-base leading-none mb-1">{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
