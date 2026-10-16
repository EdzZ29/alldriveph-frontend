import {
  BriefcaseIcon,
  CarFrontIcon,
  HeartHandshakeIcon,
  KeyRoundIcon,
  MapIcon,
  PlaneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react"

// Icons selectable for services in the admin panel
export const serviceIcons: Record<string, LucideIcon> = {
  "key-round": KeyRoundIcon,
  "user-round": UserRoundIcon,
  plane: PlaneIcon,
  sparkles: SparklesIcon,
  briefcase: BriefcaseIcon,
  map: MapIcon,
  car: CarFrontIcon,
  shield: ShieldCheckIcon,
  handshake: HeartHandshakeIcon,
}

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = serviceIcons[name] ?? CarFrontIcon
  return <Icon className={className} />
}
