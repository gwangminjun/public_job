'use client';

export function GrandmaAdminLogoutButton() {
  async function handleLogout() {
    await fetch('/api/grandma/admin-auth', { method: 'DELETE' });
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
      style={{ backgroundColor: '#FFFAF3', borderColor: '#C49A6C', color: '#7B4F2E' }}
    >
      🔒 잠금
    </button>
  );
}
