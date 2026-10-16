import { ChatWidget } from "@/components/site/chat-widget"
import { safeLoad } from "@/components/site/api-error"
import { api } from "@/lib/api"

/** How many FAQs the chat offers as one tap questions. */
const COMMON_QUESTIONS = 5

/** Loads the common questions (cached with the FAQ page) and renders the chat bubble. */
export async function ChatWidgetLoader() {
  const { data } = await safeLoad(api.faqs)
  const faqs = (data ?? []).slice(0, COMMON_QUESTIONS).map(({ question, answer }) => ({ question, answer }))
  return <ChatWidget faqs={faqs} />
}
