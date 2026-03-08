/**
 * Format an ISO date string (yyyy-mm-dd) for display as dd/mm/yy.
 * Accepts yyyy-mm-dd or date strings parseable by Date.
 * Returns "—" for empty/invalid.
 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (dateStr == null || String(dateStr).trim() === "") return "—";
  const s = String(dateStr).trim();
  const match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, y, m, d] = match;
    const day = d!.padStart(2, "0");
    const month = m!.padStart(2, "0");
    const year = y!.slice(-2);
    return `${day}/${month}/${year}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}
