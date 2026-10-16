import { PhoneIcon } from "lucide-react"

import { brandIcons, type BrandIconName } from "@/lib/brand-icons"
import type { Messages } from "@/lib/i18n/messages"
import { site } from "@/lib/site"

type IconComponent = React.ComponentType<{ className?: string }>

function brand(name: BrandIconName): IconComponent {
  const icon = brandIcons[name]
  function BrandIcon({ className }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden className={className}>
        <path d={icon.path} />
      </svg>
    )
  }
  BrandIcon.displayName = `${icon.title}Icon`
  return BrandIcon
}

export const ViberIcon = brand("viber")
export const WhatsAppIcon = brand("whatsapp")
export const MessengerIcon = brand("messenger")
export const FacebookIcon = brand("facebook")
export const GmailIcon = brand("gmail")
export const GoogleMapsIcon = brand("googlemaps")

export interface Channel {
  key: string
  label: string
  value: string
  href: string
  icon: IconComponent
  /** official brand color */
  color: string
  external?: boolean
}

export const chatChannels: Channel[] = [
  { key: "viber", label: "Viber", value: "Chat with us", href: site.chat.viber, icon: ViberIcon, color: brandIcons.viber.hex },
  { key: "whatsapp", label: "WhatsApp", value: "Chat with us", href: site.chat.whatsapp, icon: WhatsAppIcon, color: brandIcons.whatsapp.hex, external: true },
  { key: "messenger", label: "Messenger", value: "Chat with us", href: site.chat.messenger, icon: MessengerIcon, color: brandIcons.messenger.hex, external: true },
]

export const contactChannels: Channel[] = [
  { key: "call", label: "Call us", value: site.phone, href: site.phoneHref, icon: PhoneIcon, color: "#27abff" },
  ...chatChannels,
  { key: "facebook", label: "Facebook", value: "Visit our page", href: site.socials.facebook, icon: FacebookIcon, color: brandIcons.facebook.hex, external: true },
  { key: "email", label: "Email us", value: site.email, href: `mailto:${site.email}`, icon: GmailIcon, color: brandIcons.gmail.hex },
  { key: "directions", label: "Get directions", value: site.shortAddress, href: site.directionsHref, icon: GoogleMapsIcon, color: brandIcons.googlemaps.hex, external: true },
]

/** Translated label and value for a channel; brand names (Viber, WhatsApp...) stay as they are. */
export function channelText(t: Messages, channel: Channel) {
  const c = t.nav.channels
  switch (channel.key) {
    case "call":
      return { label: c.call, value: channel.value }
    case "facebook":
      return { label: c.facebook, value: c.facebookValue }
    case "email":
      return { label: c.email, value: channel.value }
    case "directions":
      return { label: c.directions, value: channel.value }
    default:
      return { label: channel.label, value: t.nav.chat.value }
  }
}
