import { useTranslation } from "react-i18next"
import { useModalTitle } from "@/shared/hooks/useModalTitle"
import { useModalStore } from "@/shared/store/modalStore"
import type { Exchange } from "../../model"
import { ExchangeForm } from "../ExchangeForm"

interface Props {
  /** Existing exchange — the modal edits it instead of recording a new one. */
  exchange?: Exchange
}

/** The exchange form ready to be shown in the global modal — see `TransactionFormModal`. */
export function ExchangeFormModal({ exchange }: Props) {
  const { t } = useTranslation()
  const close = useModalStore((s) => s.close)
  useModalTitle(t("add_modal.title_exchange"), t("add_modal.sub_exchange"))

  return <ExchangeForm exchange={exchange} onSubmit={close} onCancel={close} />
}
