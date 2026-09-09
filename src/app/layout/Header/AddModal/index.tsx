import { Stack, Tabs } from "@mantine/core"
import { IconCreditCard, IconTarget } from "@tabler/icons-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
// TODO(asset): temporarily hidden (form under development) — restore the AssetForm import and IconChartLine
// import { AssetForm } from "./AssetForm"
import { GoalForm } from "@/modules/goals/ui"
import { TransactionForm } from "@/modules/transactions/ui"
import { useModalTitle } from "@/shared/hooks/useModalTitle"
import { useModalStore } from "@/shared/store/modalStore"
import type { AddType } from "./types"

export type { AddType }

interface AddModalProps {
  /** Initial form type. Defaults to `"transaction"` */
  type?: AddType
}

/**
 * Modal container for creating financial records.
 * Contains tabs for switching between types: transaction, goal, asset.
 * Locked single-form variants live in their own modules (`TransactionFormModal`,
 * `GoalFormModal`) so pages do not have to reach up into the app layer.
 */
export function AddModal({ type: initialType = "transaction" }: AddModalProps) {
  const { t } = useTranslation()
  const [type, setType] = useState<AddType>(initialType)
  const close = useModalStore((s) => s.close)

  // the modal title lives in its header and updates on type change (tabs)
  useModalTitle(t(`add_modal.title_${type}`), t(`add_modal.sub_${type}`))

  return (
    <Stack gap={0}>
      <Tabs value={type} onChange={(v) => setType(v as AddType)} mb="md">
        <Tabs.List>
          <Tabs.Tab value="transaction" leftSection={<IconCreditCard size={14} />}>
            {t("add_modal.tab_transaction")}
          </Tabs.Tab>
          <Tabs.Tab value="goal" leftSection={<IconTarget size={14} />}>
            {t("add_modal.tab_goal")}
          </Tabs.Tab>
          {/* TODO(asset): temporarily hidden (form under development) — restore the tab (+ IconChartLine) */}
          {/* <Tabs.Tab value="asset" leftSection={<IconChartLine size={14} />}>
              Asset
            </Tabs.Tab> */}
        </Tabs.List>
      </Tabs>

      {type === "transaction" && <TransactionForm onSubmit={close} onCancel={close} />}
      {type === "goal" && <GoalForm onSubmit={close} onCancel={close} />}
      {/* TODO(asset): temporarily hidden (form under development) — restore the AssetForm render */}
      {/* {type === "asset" && <AssetForm onSubmit={close} onCancel={close} />} */}
    </Stack>
  )
}
