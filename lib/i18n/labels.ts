import { fmt } from "@/lib/i18n/config"
import type { Messages } from "@/lib/i18n/messages"

/**
 * Translates zone names that come from the API ("Within Caraga", "Rest of Mindanao").
 * City and region names are proper nouns and stay as they are.
 */
export function zoneLabel(t: Messages, name: string) {
  if (name === "Rest of Mindanao") return t.common.zones.restOfMindanao
  const within = name.match(/^Within (.+)$/)
  if (within) return fmt(t.common.zones.within, { region: within[1] })
  return name
}
