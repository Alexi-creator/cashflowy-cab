import { useMutation } from "@tanstack/react-query"
import { deleteContribution } from "./requests"
import { useInvalidateGoalData } from "./useInvalidateGoalData"

interface Options {
  goalId: string
  onSuccess?: () => void
}

/** Removes one contribution from a goal. */
export function useDeleteContribution({ goalId, onSuccess }: Options) {
  const invalidate = useInvalidateGoalData()

  return useMutation({
    mutationFn: (contributionId: string) => deleteContribution(goalId, contributionId),
    onSuccess: () => {
      invalidate(goalId)
      onSuccess?.()
    },
  })
}
