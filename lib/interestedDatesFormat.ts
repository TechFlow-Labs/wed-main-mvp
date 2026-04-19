/**
 * Parse a free-text "interested dates" string (often comma-separated YYYY-MM-DD).
 */
export function parseInterestedDateTokens(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const isoMatches = trimmed.match(/\d{4}-\d{2}-\d{2}/g);
  if (isoMatches && isoMatches.length > 0) {
    return [...new Set(isoMatches)];
  }
  return trimmed
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Pretty-print a single token: full ISO date → Greek long date, else unchanged. */
export function formatInterestedDateToken(token: string): string {
  const t = token.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
