"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import { useFinanceStore } from "../application/finance-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { Button } from "@/shared/components/ui/button";
import { FinanceProvider } from "./finance-provider";
import { TabSwitcher } from "./components/tab-switcher";
import { TransactionFiltersBar } from "./components/transaction-filters-bar";
import { TransactionDialog } from "./components/transaction-dialog";
import { OverviewTab } from "./tabs/overview-tab";
import { TransactionsTab } from "./tabs/transactions-tab";
import { BudgetsTab } from "./tabs/budgets-tab";
import { ReportsTab } from "./tabs/reports-tab";

export function FinanceView() {
  const t = useTranslations("modules.finance");
  const tFinance = useTranslations("finance");
  const tab = useFinanceStore((s) => s.tab);
  const transactions = useFinanceStore((s) => s.transactions);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setDialogOpen(true);
  }

  const editingTransaction = transactions.find((t) => t.id === editingId) ?? null;

  return (
    <FinanceProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button onClick={openCreate} className="gap-1.5">
              <PlusIcon className="size-4" />
              {tFinance("addTransaction")}
            </Button>
          }
        />

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <TabSwitcher />
          {tab === "transactions" ? <TransactionFiltersBar /> : null}
        </div>

        {tab === "overview" ? <OverviewTab onEditTransaction={openEdit} /> : null}
        {tab === "transactions" ? <TransactionsTab onEditTransaction={openEdit} /> : null}
        {tab === "budgets" ? <BudgetsTab /> : null}
        {tab === "reports" ? <ReportsTab /> : null}
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} transaction={editingTransaction} />
    </FinanceProvider>
  );
}
