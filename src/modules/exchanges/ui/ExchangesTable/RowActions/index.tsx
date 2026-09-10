import { ActionIcon, Group, Tooltip } from "@mantine/core"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { useModalStore } from "@/shared/store/modalStore"
import type { Exchange } from "../../../model"
import { DeleteExchangeConfirm } from "../../DeleteExchangeConfirm"
import { ExchangeFormModal } from "../../ExchangeFormModal"

interface Props {
  exchange: Exchange
}

/** Inline action icons for an exchange row: open the edit / delete modals. */
export function RowActions({ exchange }: Props) {
  const { t } = useTranslation()
  const open = useModalStore((s) => s.open)

  const actions = [
    {
      key: "edit",
      label: t("common.edit"),
      icon: IconPencil,
      onClick: () =>
        open({ size: "lg", centered: true, children: <ExchangeFormModal exchange={exchange} /> }),
    },
    {
      key: "delete",
      label: t("common.delete"),
      icon: IconTrash,
      color: "red",
      onClick: () =>
        open({
          centered: true,
          title: t("exchanges.delete_title"),
          children: <DeleteExchangeConfirm exchange={exchange} />,
        }),
    },
  ]

  return (
    <Group gap={4} justify="center" wrap="nowrap">
      {actions.map(({ key, label, icon: Icon, color, onClick }) => (
        <Tooltip key={key} label={label} withinPortal>
          <ActionIcon
            variant="subtle"
            size="sm"
            color={color ?? "gray"}
            aria-label={label}
            onClick={onClick}
          >
            <Icon size={15} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  )
}
