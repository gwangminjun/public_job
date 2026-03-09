function sanitize(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function getDataGoApiKey(): string {
  const candidates = [
    process.env.DATA_GO_KR_API_KEY,
    process.env.DATA_GO_API_KEY,
    process.env.NEXT_PUBLIC_DATA_GO_KR_API_KEY,
    process.env.NEXT_PUBLIC_DATA_GO_API_KEY,
  ];

  for (const candidate of candidates) {
    const normalized = sanitize(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return '';
}
