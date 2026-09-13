/**
 * src/components/ui/ConfirmDialog.jsx
 * Accessible modal dialog for destructive or high-impact actions.
 */
import React from "react";
import { Modal } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={!isLoading}
      radius="lg"
      padding="lg"
      title={
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold font-satoshi text-base">
          <div className="h-8 w-8 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span>{title}</span>
        </div>
      }
      styles={{
        content: {
          backgroundColor: "var(--color-surface, #0D1117)",
          border: "1px solid var(--color-border, rgba(255, 255, 255, 0.12))",
          color: "var(--color-heading, #F1F5F9)",
        },
        header: {
          backgroundColor: "var(--color-surface, #0D1117)",
          borderBottom: "1px solid var(--color-border, rgba(255, 255, 255, 0.08))",
        },
      }}
    >
      <div className="space-y-6 pt-2 font-inter">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;