export type ExpenseItemType = "PLANNED" | "ACTUAL";

export type ExpenseCategory = {
  id: string;
  userId: string;
  planId: string | null;
  name: string;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseRecurringRule = {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  note?: string | null;
  vendorName?: string | null;
  amount: string;
  currency: string;
  dayOfMonth: number;
  startMonthKey: string;
  endMonthKey?: string | null;
  isActive: boolean;
  lastGeneratedMonthKey?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ExpenseCategory | null;
};

export type ExpenseItem = {
  id: string;
  userId: string;
  planId: string;
  categoryId?: string | null;
  title: string;
  note?: string | null;
  vendorName?: string | null;
  type: ExpenseItemType;
  status: "ACTIVE" | "DONE" | "SKIPPED";
  amountPlanned?: string | null;
  amountActual?: string | null;
  currency: string;
  expenseDate: string;
  paidAt?: string | null;
  isRecurringGenerated: boolean;
  recurringRuleId?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ExpenseCategory | null;
};

export type ExpenseMonthPlan = {
  id: string;
  userId: string;
  monthKey: string;
  monthDate: string;
  currency: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  incomePlanned?: string | null;
  incomeActual?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  categories: ExpenseCategory[];
  items: ExpenseItem[];
};

export type MonthAnalytics = {
  summary: {
    incomePlanned: number;
    incomeActual: number;
    totalPlanned: number;
    totalActual: number;
    balancePlanned: number;
    balanceActual: number;
    budgetUsagePercent: number;
    recommendedDailyLimit: number;
  };
  byCategory: Array<{
    categoryId: string;
    name: string;
    color?: string | null;
    icon?: string | null;
    planned: number;
    actual: number;
    delta: number;
    usagePercent: number;
  }>;
  donut: Array<{
    id: string;
    label: string;
    value: number;
    color?: string;
    icon?: string;
  }>;
  cumulativeByDay: Array<{
    day: number;
    planned: number;
    actual: number;
    cumulativePlanned: number;
    cumulativeActual: number;
  }>;
  topLeaks: Array<{
    categoryId: string;
    name: string;
    overspend: number;
  }>;
};

export type HistoryAnalytics = {
  trend: Array<{
    monthKey: string;
    incomePlanned: number;
    incomeActual: number;
    totalPlanned: number;
    totalActual: number;
    delta: number;
  }>;
  comparison: {
    currentMonth: string;
    prevMonth: string;
    actualDiff: number;
    actualDiffPercent: number;
  } | null;
};

export type GetExpenseMonthResponse = {
  plan: ExpenseMonthPlan;
  globalCategories: ExpenseCategory[];
  recurringRules: ExpenseRecurringRule[];
  analytics: MonthAnalytics;
};

export type ListExpenseMonthsResponse = {
  months: Array<{
    id: string;
    userId: string;
    monthKey: string;
    monthDate: string;
    currency: string;
    status: "OPEN" | "CLOSED" | "ARCHIVED";
    incomePlanned?: string | null;
    incomeActual?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      type: ExpenseItemType;
      amountPlanned?: string | null;
      amountActual?: string | null;
    }>;
  }>;
  historyAnalytics: HistoryAnalytics;
};

export type EnsureExpenseMonthDto = {
  monthKey: string;
  currency?: string;
};

export type UpdateExpenseMonthDto = {
  incomePlanned?: number;
  incomeActual?: number;
  notes?: string;
};

export type CreateExpenseCategoryDto = {
  name: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isSystem?: boolean;
  planId?: string;
};

export type UpdateExpenseCategoryDto = {
  name?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type CreateExpenseItemDto = {
  planId: string;
  categoryId?: string;
  title: string;
  note?: string;
  vendorName?: string;
  type: ExpenseItemType;
  amountPlanned?: number;
  amountActual?: number;
  currency?: string;
  expenseDate: string;
  paidAt?: string;
};

export type UpdateExpenseItemDto = {
  categoryId?: string | null;
  title?: string;
  note?: string;
  vendorName?: string;
  type?: ExpenseItemType;
  amountPlanned?: number | null;
  amountActual?: number | null;
  currency?: string;
  expenseDate?: string;
  paidAt?: string | null;
};

export type CreateExpenseRecurringRuleDto = {
  categoryId?: string;
  title: string;
  note?: string;
  vendorName?: string;
  amount: number;
  currency?: string;
  dayOfMonth: number;
  startMonthKey: string;
  endMonthKey?: string;
  isActive?: boolean;
};

export type UpdateExpenseRecurringRuleDto = {
  categoryId?: string | null;
  title?: string;
  note?: string;
  vendorName?: string;
  amount?: number;
  currency?: string;
  dayOfMonth?: number;
  startMonthKey?: string;
  endMonthKey?: string | null;
  isActive?: boolean;
};
