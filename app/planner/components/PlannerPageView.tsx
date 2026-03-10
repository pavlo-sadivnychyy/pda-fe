"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, CircularProgress, Grid, Stack } from "@mui/material";
import { useExpensePlannerMonth } from "../hooks/planner/useExpensePlannerMonth";
import { useExpensePlannerMonths } from "../hooks/planner/useExpensePlannerMonths";
import { useExpensePlannerMutations } from "../hooks/planner/useExpensePlannerMutations";
import { ExpenseItem, ExpenseRecurringRule } from "../planner.types";
import {
  buildMonthOptions,
  getCurrentMonthKey,
  mergeUniqueCategories,
} from "../helpers";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerSummaryCards } from "./PlannerSummaryCards";
import { PlannerMonthTabs } from "./PlannerMonthTabs";
import { PlannerEmptyState } from "./PlannerEmptyState";
import { PlannerCategoryBreakdown } from "./PlannerCategoryBreakdown";
import { PlannerRecurringRulesCard } from "./PlannerRecurringRulesCard";
import { PlannerItemsTable } from "./PlannerItemsTable";
import { ExpenseItemDialog } from "./ExpenseItemDialog";
import { RecurringRuleDialog } from "./RecurringRuleDialog";
import { PlannerIncomeCard } from "./PlannerIncomeCard";
import { PlannerCharts } from "./PlannerCharts";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

export function PlannerPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const monthKey = searchParams.get("month") || getCurrentMonthKey();

  const [tab, setTab] = useState<"overview" | "items" | "rules">("overview");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [editingRule, setEditingRule] = useState<ExpenseRecurringRule | null>(
    null,
  );

  const monthQuery = useExpensePlannerMonth(monthKey);
  const monthsQuery = useExpensePlannerMonths();
  const mutations = useExpensePlannerMutations(monthKey);

  const data = monthQuery.data;
  const history = monthsQuery.data?.historyAnalytics;

  const monthOptions = useMemo(
    () =>
      buildMonthOptions(
        monthKey,
        monthsQuery.data?.months.map((x) => x.monthKey) ?? [],
      ),
    [monthKey, monthsQuery.data?.months],
  );

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.push(`/planner?${params.toString()}`);
  };

  if (monthQuery.isLoading || monthsQuery.isLoading || !data || !history) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const categories = mergeUniqueCategories(
    data.globalCategories,
    data.plan.categories,
  );

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button
          onClick={() => router.push("/dashboard")}
          sx={{ color: "black", mb: 0 }}
          startIcon={<KeyboardReturnIcon fontSize="inherit" />}
        >
          на головну
        </Button>
      </Box>

      <PlannerHeader
        monthKey={monthKey}
        monthOptions={monthOptions}
        onMonthChange={handleMonthChange}
        onAddItem={() => {
          setEditingItem(null);
          setItemDialogOpen(true);
        }}
        onAddRule={() => {
          setEditingRule(null);
          setRuleDialogOpen(true);
        }}
        onGenerateRecurring={() => mutations.generateRecurring.mutate()}
        generating={mutations.generateRecurring.isPending}
      />

      <PlannerIncomeCard
        onGenerateRecurring={() => mutations.generateRecurring.mutate()}
        generating={mutations.generateRecurring.isPending}
        currency={data.plan.currency}
        incomePlanned={data.plan.incomePlanned}
        incomeActual={data.plan.incomeActual}
        notes={data.plan.notes}
        loading={mutations.updateMonth.isPending}
        onSave={(payload) => mutations.updateMonth.mutateAsync(payload)}
      />

      <PlannerSummaryCards
        analytics={data.analytics}
        currency={data.plan.currency}
      />

      <PlannerMonthTabs value={tab} onChange={setTab} />

      {data.plan.items.length === 0 ? (
        <PlannerEmptyState onCreate={() => setItemDialogOpen(true)} />
      ) : null}

      {tab === "overview" ? (
        <>
          <PlannerCharts analytics={data.analytics} history={history} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <PlannerCategoryBreakdown
                analytics={data.analytics}
                currency={data.plan.currency}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <PlannerRecurringRulesCard
                rules={data.recurringRules}
                onEdit={(rule) => {
                  setEditingRule(rule);
                  setRuleDialogOpen(true);
                }}
                onDelete={(id) => mutations.deleteRecurringRule.mutate(id)}
              />
            </Grid>
          </Grid>
        </>
      ) : null}

      {tab === "items" ? (
        <PlannerItemsTable
          items={data.plan.items}
          currency={data.plan.currency}
          onEdit={(item) => {
            setEditingItem(item);
            setItemDialogOpen(true);
          }}
          onDelete={(id) => mutations.deleteItem.mutate(id)}
        />
      ) : null}

      {tab === "rules" ? (
        <PlannerRecurringRulesCard
          rules={data.recurringRules}
          onEdit={(rule) => {
            setEditingRule(rule);
            setRuleDialogOpen(true);
          }}
          onDelete={(id) => mutations.deleteRecurringRule.mutate(id)}
        />
      ) : null}

      <ExpenseItemDialog
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }}
        categories={categories}
        planId={data.plan.id}
        currency={data.plan.currency}
        item={editingItem}
        onCreate={(payload) => mutations.createItem.mutateAsync(payload)}
        onUpdate={(id, payload) =>
          mutations.updateItem.mutateAsync({ id, payload })
        }
      />

      <RecurringRuleDialog
        open={ruleDialogOpen}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        categories={categories}
        monthKey={monthKey}
        rule={editingRule}
        onCreate={(payload) =>
          mutations.createRecurringRule.mutateAsync(payload)
        }
        onUpdate={(id, payload) =>
          mutations.updateRecurringRule.mutateAsync({ id, payload })
        }
      />
    </Stack>
  );
}
