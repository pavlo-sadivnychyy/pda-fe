import { ExpenseCategory } from "./planner.types";

export function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function buildMonthOptions(
  currentMonthKey: string,
  historyKeys: string[],
) {
  const set = new Set<string>(historyKeys);
  const now = new Date();

  for (let i = -6; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  set.add(currentMonthKey);

  return [...set].sort();
}

export function mergeUniqueCategories(
  globalCategories: ExpenseCategory[],
  monthCategories: ExpenseCategory[],
) {
  const map = new Map<string, ExpenseCategory>();

  [...globalCategories, ...monthCategories].forEach((category) => {
    if (!map.has(category.id)) {
      map.set(category.id, category);
    }
  });

  return [...map.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}
