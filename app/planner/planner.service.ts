import { api } from "@/libs/axios";
import {
  CreateExpenseCategoryDto,
  CreateExpenseItemDto,
  CreateExpenseRecurringRuleDto,
  EnsureExpenseMonthDto,
  GetExpenseMonthResponse,
  ListExpenseMonthsResponse,
  UpdateExpenseCategoryDto,
  UpdateExpenseItemDto,
  UpdateExpenseMonthDto,
  UpdateExpenseRecurringRuleDto,
} from "./planner.types";

export const plannerService = {
  async ensureMonth(payload: EnsureExpenseMonthDto) {
    const { data } = await api.post<GetExpenseMonthResponse>(
      "/expense-planner/months/ensure",
      payload,
    );
    return data;
  },

  async getMonth(monthKey: string) {
    const { data } = await api.get<GetExpenseMonthResponse>(
      `/expense-planner/months/${monthKey}`,
    );
    return data;
  },

  async listMonths(params?: { from?: string; to?: string }) {
    const { data } = await api.get<ListExpenseMonthsResponse>(
      "/expense-planner/months",
      { params },
    );
    return data;
  },

  async updateMonth(monthKey: string, payload: UpdateExpenseMonthDto) {
    const { data } = await api.patch<GetExpenseMonthResponse>(
      `/expense-planner/months/${monthKey}`,
      payload,
    );
    return data;
  },

  async generateRecurring(monthKey: string) {
    const { data } = await api.post<{ generated: number }>(
      `/expense-planner/months/${monthKey}/generate-recurring`,
    );
    return data;
  },

  async createCategory(payload: CreateExpenseCategoryDto) {
    const { data } = await api.post("/expense-planner/categories", payload);
    return data;
  },

  async updateCategory(id: string, payload: UpdateExpenseCategoryDto) {
    const { data } = await api.patch(
      `/expense-planner/categories/${id}`,
      payload,
    );
    return data;
  },

  async deleteCategory(id: string) {
    const { data } = await api.delete(`/expense-planner/categories/${id}`);
    return data;
  },

  async createItem(payload: CreateExpenseItemDto) {
    const { data } = await api.post("/expense-planner/items", payload);
    return data;
  },

  async updateItem(id: string, payload: UpdateExpenseItemDto) {
    const { data } = await api.patch(`/expense-planner/items/${id}`, payload);
    return data;
  },

  async deleteItem(id: string) {
    const { data } = await api.delete(`/expense-planner/items/${id}`);
    return data;
  },

  async createRecurringRule(payload: CreateExpenseRecurringRuleDto) {
    const { data } = await api.post(
      "/expense-planner/recurring-rules",
      payload,
    );
    return data;
  },

  async updateRecurringRule(
    id: string,
    payload: UpdateExpenseRecurringRuleDto,
  ) {
    const { data } = await api.patch(
      `/expense-planner/recurring-rules/${id}`,
      payload,
    );
    return data;
  },

  async deleteRecurringRule(id: string) {
    const { data } = await api.delete(`/expense-planner/recurring-rules/${id}`);
    return data;
  },
};
