import { useMutation } from "@tanstack/react-query"
import { updateGoal } from "./requests"
import { useInvalidateGoalData } from "./useInvalidateGoalData"

interface Options {
  goalId: string
  onSuccess?: () => void
}

/** Archives a goal, releasing the money it had reserved. */
export function useCloseGoal({ goalId, onSuccess }: Options) {
  const invalidate = useInvalidateGoalData()

  return useMutation({
    mutationFn: () => updateGoal(goalId, { archived: true }),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
  })
}
