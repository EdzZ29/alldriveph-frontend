export type VehicleCategory = "sedan" | "suv" | "mpv" | "pickup" | "van"
export type Transmission = "automatic" | "manual"
export type FuelType = "gasoline" | "diesel" | "hybrid"
export type ServiceType = "self_drive" | "with_driver"
export type BookingStatus = "pending" | "confirmed" | "ongoing" | "completed" | "cancelled"
export type UserRole = "admin" | "staff" | "owner"

export interface Vehicle {
  id: string
  slug: string
  name: string
  brand: string
  model: string
  year: number
  category: VehicleCategory
  transmission: Transmission
  fuel_type: FuelType
  seats: number
  luggage: number
  color: string | null
  daily_rate: number
  driver_rate: number
  /** daily rate per destination zone code; missing zones use daily_rate */
  zone_rates: Partial<Record<ZoneCode, number>>
  image_url: string
  description: string
  features: string[]
  branch: BranchCode
  is_featured: boolean
}

/** A car as list pages load it: everything except the long description and feature list. */
export type VehicleSummary = Omit<Vehicle, "description" | "features">

export interface VehicleAdmin extends Vehicle {
  plate_number: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Location {
  code: string
  name: string
  address: string
  branch: string
  branch_code: BranchCode
}

export type BranchCode = "butuan" | "cagayan-de-oro" | "davao"

export interface Branch {
  code: BranchCode
  name: string
  city: string
}

/** zones are relative to the car's branch: its city, its region, the other branch cities, the rest */
export type ZoneCode = "local" | "region" | "cities" | "mindanao"

export interface RateZone {
  code: ZoneCode
  name: string
  groups: { name: string | null; places: string[] }[]
}

export interface Extra {
  code: string
  name: string
  description: string
  price: number
  per_day: boolean
}

export interface Meta {
  branches: Branch[]
  locations: Location[]
  zones: Record<BranchCode, RateZone[]>
  extras: Extra[]
  categories: VehicleCategory[]
  policies: {
    min_lead_hours: number
    min_rental_hours: number
    max_rental_days: number
    long_rental_days: number
    long_rental_discount: number
    security_deposit: number
    default_driver_rate: number
  }
}

export interface Quote {
  vehicle_id: string
  days: number
  daily_rate: number
  base_amount: number
  discount_amount: number
  driver_amount: number
  extras_amount: number
  total_amount: number
  security_deposit: number
  line_items: { label: string; amount: number }[]
  available: boolean
}

export interface Booking {
  id: string
  reference: string
  status: BookingStatus
  service_type: ServiceType
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_location: string
  return_location: string
  delivery_address: string | null
  /** optional exact spot within the branch area, e.g. a hotel or landmark */
  pickup_address: string | null
  return_address: string | null
  destination_zone: ZoneCode
  destination: string | null
  pickup_at: string
  return_at: string
  extras: string[]
  days: number
  daily_rate: number
  base_amount: number
  discount_amount: number
  driver_amount: number
  extras_amount: number
  total_amount: number
  notes: string | null
  created_at: string
  vehicle: Vehicle
}

export interface BookingAdmin extends Booking {
  license_number: string | null
  admin_notes: string | null
  cancelled_at: string | null
  updated_at: string
}

export interface Service {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  icon: string
  price_from: number | null
  highlights: string[]
  sort_order: number
  is_active: boolean
}

export interface Partner {
  id: string
  name: string
  category: string
  description: string
  logo_url: string | null
  /** wide photo or banner shown at the top of the partner card */
  image_url: string | null
  website_url: string | null
  sort_order: number
  is_active: boolean
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
}

export interface BlogPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string | null
  author_name: string
  tags: string[]
  reading_minutes: number
  published_at: string | null
}

export interface BlogPost extends BlogPostSummary {
  content: string
}

export interface BlogPostAdmin extends BlogPost {
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  /** the branch a branch owner manages; null for admins and staff */
  branch: BranchCode | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface AdminStats {
  revenue_month: number
  bookings_month: number
  pending: number
  confirmed: number
  ongoing: number
  completed: number
  cancelled: number
  active_fleet: number
  on_road: number
  utilization: number
  unread_messages: number
  monthly: { month: string; revenue: number; bookings: number }[]
  upcoming: (Pick<BookingAdmin, "id" | "customer_name" | "pickup_at" | "status"> & { vehicle: Pick<Vehicle, "name"> })[]
}

/** One bad field in a 422 answer. */
export interface ApiFieldError {
  field: string | null
  message: string
}

/** What the API sends with a non 200 status. */
export interface ApiErrorBody {
  error: {
    /** the operation that failed, e.g. "create_booking" */
    op: string | null
    message: string
    code: string
    status: number
    errors?: ApiFieldError[]
  }
}

export type ChatSender = "visitor" | "bot" | "staff"

export interface ChatMessage {
  id: string
  conversation_id: string
  sender: ChatSender
  /** the team member's name on staff replies */
  author: string | null
  body: string
  created_at: string
}

export interface ChatConversation {
  id: string
  status: "open" | "closed"
  /** the page the visitor started on */
  page: string | null
  lang: string
  /** visitor messages nobody on the team has opened yet */
  staff_unread: number
  last_message: string
  last_message_at: string
  created_at: string
}

/** Live event: a booking was made or moved along. */
export interface BookingNotice {
  id: string
  reference: string
  status: BookingStatus
  customer_name: string
  vehicle_name: string
  pickup_at: string
  branch: BranchCode | null
  change: "created" | "updated"
}

/** Live event: a contact form message arrived. */
export interface ContactNotice {
  id: string
  name: string
  subject: string
}

/** An automatic message to the customer about their booking, and whether it reached them. */
export interface BookingNotification {
  id: string
  channel: "email" | "sms"
  event: "confirmed" | "cancelled"
  /** the email address (or phone number) it went to */
  recipient: string
  /** skipped: the channel is not set up yet */
  status: "sent" | "failed" | "skipped"
  error: string | null
  created_at: string
}

/** A booking as the admin booking window loads it, with its customer messages. */
export interface BookingDetail extends BookingAdmin {
  notifications: BookingNotification[]
}

/** What a branch owner owes Alldrive for one completed booking. */
export interface Commission {
  id: string
  booking_id: string
  branch: BranchCode
  booking_total: number
  /** e.g. 0.1 for 10% */
  rate: number
  amount: number
  status: "unpaid" | "paid"
  paid_at: string | null
  /** the admin who recorded the payment */
  paid_by: string | null
  payment_note: string | null
  created_at: string
  booking: { reference: string; customer_name: string; vehicle_name: string; pickup_at: string; return_at: string; days: number }
}

export interface CommissionTotals {
  unpaid_amount: number
  unpaid_count: number
  paid_amount: number
  paid_count: number
  /** earned this month, paid or not */
  month_amount: number
}

export interface CommissionSummary extends CommissionTotals {
  rate: number
  branches: (CommissionTotals & { branch: BranchCode })[]
}

/** Live event: a commission was earned, paid or reopened. */
export interface CommissionNotice {
  id: string
  booking_id: string
  reference: string
  branch: BranchCode
  amount: number
  status: "unpaid" | "paid"
  change: "created" | "paid" | "unpaid"
}
