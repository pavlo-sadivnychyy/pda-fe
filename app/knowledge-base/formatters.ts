export function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export function formatStatus(status: string) {
  switch (status) {
    case "READY":
      return "Готовий";
    case "PROCESSING":
      return "Обробка";
    case "FAILED":
      return "Помилка";
    default:
      return status;
  }
}

export function formatDateStable(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const iso = d.toISOString();
  return iso.slice(0, 16).replace("T", " ");
}

export function getStatusColor(status: string) {
  switch (status) {
    case "READY":
      return "#bbf7d0";
    case "PROCESSING":
      return "#fef3c7";
    case "FAILED":
      return "#fee2e2";
    default:
      return "#e5e7eb";
  }
}

export function makeSnippet(text: string, query: string, max = 200) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) return text.length > max ? text.slice(0, max) + "…" : text;

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 40);
  const slice = text.slice(start, end);

  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}
