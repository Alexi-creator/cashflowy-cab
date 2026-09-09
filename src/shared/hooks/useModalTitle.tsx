import { Stack, Text } from "@mantine/core"
import { useEffect } from "react"
import { useModalStore } from "@/shared/store/modalStore"

/**
 * Puts a two-line heading (title + subtitle) into the global modal's header.
 * It lives in shared so that forms from different modules render the same header without
 * depending on each other or going through the app layer.
 */
export function useModalTitle(title: string, subtitle: string) {
  const setTitle = useModalStore((s) => s.setTitle)

  useEffect(() => {
    setTitle(
      <Stack gap={2}>
        <Text fw={600} size="md">
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {subtitle}
        </Text>
      </Stack>,
    )
  }, [title, subtitle, setTitle])
}
