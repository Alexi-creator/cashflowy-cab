import { useMutation } from "@tanstack/react-query"
import type { Goal } from "../model"
import type { CreateContributionPayload } from "./requests"
import { createContribution, updateContribution } from "./requests"
import { useInvalidateGoalData } from "./useInvalidateGoalData"

interface Options {
  goalId: string
  /** Id of the contribution being edited; absent when adding a new one. */
  contributionId?: string
  onSuccess?: (updatedGoal: Goal) => void
  onError?: (error: Error) => void
}

/** Adds or edits a deposit/withdrawal on a goal. */
export function useSaveContribution({ goalId, contributionId, onSuccess, onError }: Options) {
  const invalidate = useInvalidateGoalData()

  return useMutation({
    mutationFn: (payload: CreateContributionPayload) =>
      contributionId
        ? updateContribution(goalId, contributionId, payload)
        : createContribution(goalId, payload),
    onSuccess: (updatedGoal) => {
      invalidate(goalId)
      onSuccess?.(updatedGoal)
    },
    onError: (error) => onError?.(error),
  })
}
