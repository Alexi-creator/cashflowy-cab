import { useTranslation } from "react-i18next"
import { useModalTitle } from "@/shared/hooks/useModalTitle"
import { useModalStore } from "@/shared/store/modalStore"
import { GoalForm } from "../GoalForm"

/** The goal form ready to be shown in the global modal — see `TransactionFormModal`. */
export function GoalFormModal() {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)
  useModalTitle(t("add_modal.title_goal"), t("add_modal.sub_goal"))

  return <GoalForm onSubmit={close} onCancel={close} />
}
