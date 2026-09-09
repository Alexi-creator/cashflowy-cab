import { useMutation } from "@tanstack/react-query"
import { deleteGoal } from "./requests"
import { useInvalidateGoalData } from "./useInvalidateGoalData"

interface Options {
  goalId: string
  onSuccess?: () => void
}

/** Deletes a goal along with its contributions. */
export function useDeleteGoal({ goalId, onSuccess }: Options) {
  const invalidate = useInvalidateGoalData()

  return useMutation({
    mutationFn: () => deleteGoal(goalId),
    onSuccess: () => {
      invalidate()
      onSuccess?.()
    },
  })
}
