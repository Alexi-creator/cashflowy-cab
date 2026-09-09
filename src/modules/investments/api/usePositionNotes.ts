import { useMutation, useQueryClient } from "@tanstack/react-query"
import { investingKeys } from "./queries"
import {
  createPositionNote,
  deletePositionNote,
  type PositionNotePayload,
  updatePositionNote,
} from "./requests"

interface Options {
  positionId: string
  onError?: (error: Error) => void
}

/**
 * Notes attached to one trade. They come embedded in the position, so every change invalidates
 * the positions namespace rather than a notes key of its own.
 */
export function usePositionNotes({ positionId, onError }: Options) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: investingKeys.allPositions })
  const fail = (error: Error) => onError?.(error)

  const create = useMutation({
    mutationFn: (payload: PositionNotePayload) => createPositionNote(positionId, payload),
    onSuccess: invalidate,
    onError: fail,
  })

  const update = useMutation({
    mutationFn: ({ noteId, body }: { noteId: string; body: string }) =>
      updatePositionNote(positionId, noteId, { body }),
    onSuccess: invalidate,
    onError: fail,
  })

  const remove = useMutation({
    mutationFn: (noteId: string) => deletePositionNote(positionId, noteId),
    onSuccess: invalidate,
    onError: fail,
  })

  return { create, update, remove }
}
