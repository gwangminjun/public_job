'use client';

export function GrandmaPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border print:hidden"
      style={{ borderColor: '#C49A6C', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}
    >
      🖨️ 사진첩 인쇄
    </button>
  );
}
