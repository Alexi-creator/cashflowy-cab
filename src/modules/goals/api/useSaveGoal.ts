import { useMutation } from "@tanstack/react-query"
import type { CreateGoalPayload } from "./requests"
import { createContribution, createGoal, updateGoal } from "./requests"
import { useInvalidateGoalData } from "./useInvalidateGoalData"

interface Options {
  /** Id of the goal being edited; absent when creating a new one. */
  goalId?: string
  onSuccess?: () => void
}

/** Payload plus the optional opening balance, which only makes sense when creating. */
type Variables = CreateGoalPayload & { initialAmount?: number }

/** Creates or updates a goal; on creation an opening contribution is added in the same step. */
export function useSaveGoal({ goalId, onSuccess }: Options) {
  const invalidate = useInvalidateGoalData()

  return useMutation({
    mutationFn: async ({ initialAmount, ...payload }: Variables) => {
      if (goalId) return updateGoal(goalId, payload)

      const created = await createGoal(payload)
      if (initialAmount && initialAmount > 0) {
        await createContribution(created.id, { amount: initialAmount })
      }
      return created
    },
    onSuccess: () => {
      // an initial contribution reserves money and may complete the goal
      invalidate()
      onSuccess?.()
    },
  })
}
