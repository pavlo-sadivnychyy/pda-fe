"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateExpenseCategoryDto,
  CreateExpenseItemDto,
  CreateExpenseRecurringRuleDto,
  UpdateExpenseCategoryDto,
  UpdateExpenseItemDto,
  UpdateExpenseMonthDto,
  UpdateExpenseRecurringRuleDto,
} from "../../planner.types";

import { plannerQueryKeys } from "./queryKeys";
import { plannerService } from "../../planner.service";

export function useExpensePlannerMutations(monthKey: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: plannerQueryKeys.month(monthKey),
      }),
      queryClient.invalidateQueries({
        queryKey: ["expense-planner", "months"],
      }),
    ]);
  };

  const updateMonth = useMutation({
    mutationFn: (payload: UpdateExpenseMonthDto) =>
      plannerService.updateMonth(monthKey, payload),
    onSuccess: invalidate,
  });

  const createCategory = useMutation({
    mutationFn: (payload: CreateExpenseCategoryDto) =>
      plannerService.createCategory(payload),
    onSuccess: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseCategoryDto;
    }) => plannerService.updateCategory(id, payload),
    onSuccess: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => plannerService.deleteCategory(id),
    onSuccess: invalidate,
  });

  const createItem = useMutation({
    mutationFn: (payload: CreateExpenseItemDto) =>
      plannerService.createItem(payload),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseItemDto;
    }) => plannerService.updateItem(id, payload),
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => plannerService.deleteItem(id),
    onSuccess: invalidate,
  });

  const createRecurringRule = useMutation({
    mutationFn: (payload: CreateExpenseRecurringRuleDto) =>
      plannerService.createRecurringRule(payload),
    onSuccess: invalidate,
  });

  const updateRecurringRule = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseRecurringRuleDto;
    }) => plannerService.updateRecurringRule(id, payload),
    onSuccess: invalidate,
  });

  const deleteRecurringRule = useMutation({
    mutationFn: (id: string) => plannerService.deleteRecurringRule(id),
    onSuccess: invalidate,
  });

  const generateRecurring = useMutation({
    mutationFn: () => plannerService.generateRecurring(monthKey),
    onSuccess: invalidate,
  });

  return {
    updateMonth,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    createRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    generateRecurring,
  };
}
