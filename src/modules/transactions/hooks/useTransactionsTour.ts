import { useTranslation } from "react-i18next"
import { useTour } from "@/shared/hooks/useTour"

/**
 * Guided walkthrough of the transactions page, on top of the shared nav + "Add" intro from
 * `useTour`.
 *
 * The page shows one of two tables, so the tour follows the visible one: explaining filters and
 * bulk selection while the exchanges table is open would describe controls that are not there.
 * Steps are built when the tour starts, so the current view is always the one described.
 */
export function useTransactionsTour(view: "transactions" | "exchanges") {
  const { t } = useTranslation()

  return useTour(() =>
    view === "exchanges"
      ? [
          {
            element: "[data-tour='tx-add']",
            popover: {
              title: t("exchanges.tour_tab_title"),
              description: t("exchanges.tour_tab_desc"),
              side: "bottom",
              align: "end",
            },
          },
          {
            element: "[data-tour='tx-list']",
            popover: {
              title: t("exchanges.tour_list_title"),
              description: t("exchanges.tour_list_desc"),
              side: "top",
            },
          },
        ]
      : [
          {
            element: "[data-tour='tx-add']",
            popover: {
              title: t("transactions.tour_add_title"),
              description: t("transactions.tour_add_desc"),
              side: "bottom",
              align: "end",
            },
          },
          {
            element: "[data-tour='tx-list']",
            popover: {
              title: t("transactions.tour_list_title"),
              description: t("transactions.tour_list_desc"),
              side: "top",
            },
          },
          {
            // Last, and only from the transactions view: this is where the other table is
            // discovered, and it is the only hint that exchanges exist at all.
            element: "[data-tour='tx-exchanges']",
            popover: {
              title: t("exchanges.tour_tab_title"),
              description: t("exchanges.tour_tab_desc"),
              side: "bottom",
            },
          },
        ],
  )
}
