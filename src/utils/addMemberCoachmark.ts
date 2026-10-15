export const COACHMARK_STORAGE_KEY = 'split-bill:coachmark:add-member';
export const COACHMARK_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type CoachmarkStorage = { dismissedAt?: string } | null;

/** Returns true when a previous dismissal is still inside the 30-day cooldown window. */
export function isAddMemberCoachmarkSuppressed(now = Date.now()): boolean {
  let stored: CoachmarkStorage = null;
  try {
    const raw = localStorage.getItem(COACHMARK_STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as CoachmarkStorage) : null;
  } catch {
    stored = null;
  }
  const dismissedAt = stored?.dismissedAt
    ? new Date(stored.dismissedAt).getTime()
    : NaN;
  if (!Number.isFinite(dismissedAt)) return false;
  return now - dismissedAt < COACHMARK_COOLDOWN_MS;
}

/** Records the dismissal timestamp that gates the 30-day cooldown. */
export function suppressAddMemberCoachmark() {
  localStorage.setItem(
    COACHMARK_STORAGE_KEY,
    JSON.stringify({ dismissedAt: new Date().toISOString() }),
  );
}