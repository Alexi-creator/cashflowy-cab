import { useTranslation } from "react-i18next"
import { useModalTitle } from "@/shared/hooks/useModalTitle"
import { useModalStore } from "@/shared/store/modalStore"
import { TransactionForm } from "../TransactionForm"

interface TransactionFormModalProps {
  /** Prefill for the form (e.g. when creating from a category card). */
  defaults?: { kind?: "income" | "expense"; categoryId?: string }
}

/**
 * The transaction form ready to be shown in the global modal: it sets its own heading and
 * closes on submit/cancel. It exists so pages (the Categories screen included) can open the
 * form straight from the module instead of going through the composite AddModal in app/.
 */
export function TransactionFormModal({ defaults }: TransactionFormModalProps) {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)
  useModalTitle(t("add_modal.title_transaction"), t("add_modal.sub_transaction"))

  return (
    <TransactionForm
      onSubmit={close}
      onCancel={close}
      initialKind={defaults?.kind}
      initialCategoryId={defaults?.categoryId}
    />
  )
}
