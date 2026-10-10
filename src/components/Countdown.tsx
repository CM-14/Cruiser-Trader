import { countdown } from '@/lib/format'
import { useNow } from '@/lib/store'

export function Countdown({ end }: { end: number }) {
  const now = useNow()
  return <span suppressHydrationWarning>{now === null ? '--:--:--' : countdown(end, now)}</span>
}
