import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { createManualPosition, type ManualPositionPayload, updateManualPosition } from "./requests"

interface Options {
  /** Id of the position being edited; absent when adding a new one. */
  positionId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Adds or edits a manually entered trade. */
export function useSaveManualPosition({ positionId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ManualPositionPayload) =>
      positionId ? updateManualPosition(positionId, payload) : createManualPosition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.allPositions })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
