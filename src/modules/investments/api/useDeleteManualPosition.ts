import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import { deleteManualPosition } from "./requests"

interface Options {
  positionId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** Removes a manually entered trade. */
export function useDeleteManualPosition({ positionId, onSuccess, onError }: Options) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteManualPosition(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investingKeys.allPositions })
      onSuccess?.()
    },
    onError: (error) => onError?.(error),
  })
}
