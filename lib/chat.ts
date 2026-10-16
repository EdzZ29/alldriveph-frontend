import type { ChatSender } from "@/lib/types"

/** Messages this close together from the same person read as one burst, like most chat apps. */
const GROUP_WINDOW_MS = 5 * 60_000

interface Groupable {
  sender: ChatSender
  author: string | null
  /** missing for common questions answered in the browser, which always follow on */
  created_at?: string
}

/**
 * True when `message` continues the burst `previous` started: same sender (and same team
 * member) within a few minutes. The name and time are then shown once, above the first message.
 */
export function continuesGroup(previous: Groupable | undefined, message: Groupable): boolean {
  if (!previous || previous.sender !== message.sender || previous.author !== message.author) return false
  if (!previous.created_at || !message.created_at) return true
  return Math.abs(new Date(message.created_at).getTime() - new Date(previous.created_at).getTime()) <= GROUP_WINDOW_MS
}
