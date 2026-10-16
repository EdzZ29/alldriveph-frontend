"use client"

import Image from "next/image"

import { useAdminUser } from "@/components/admin/admin-shell"
import { ResourceManager, type FieldDef } from "@/components/admin/resource-manager"
import { ServiceIcon } from "@/components/site/icons"
import { Badge } from "@/components/ui/badge"
import { branchShort } from "@/lib/branch-labels"
import { categoryLabels, formatDate, peso } from "@/lib/format"
import { resources } from "@/lib/admin-queries"
import type { BlogPostAdmin, Faq, Partner, Service, VehicleAdmin } from "@/lib/types"

const SLUG_HELP = "Leave blank to generate from the name. Lowercase letters, numbers and dashes only."

function ActiveBadge({ active, on = "Active", off = "Hidden" }: { active: boolean; on?: string; off?: string }) {
  return active ? (
    <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
      {on}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      {off}
    </Badge>
  )
}

// ---------- Fleet ----------

const vehicleFields: FieldDef[] = [
  { name: "name", label: "Display name", type: "text", required: true, placeholder: "Toyota Vios 1.3 XLE AT", wide: true },
  { name: "brand", label: "Brand", type: "text", required: true },
  { name: "model", label: "Model", type: "text", required: true },
  { name: "year", label: "Year", type: "number", required: true, min: 1990 },
  { name: "color", label: "Color", type: "text", nullable: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
  },
  {
    name: "transmission",
    label: "Transmission",
    type: "select",
    required: true,
    options: [
      { value: "automatic", label: "Automatic" },
      { value: "manual", label: "Manual" },
    ],
  },
  {
    name: "fuel_type",
    label: "Fuel",
    type: "select",
    required: true,
    options: [
      { value: "gasoline", label: "Gasoline" },
      { value: "diesel", label: "Diesel" },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  { name: "plate_number", label: "Plate number", type: "text", nullable: true },
  {
    name: "branch",
    label: "Branch",
    type: "select",
    required: true,
    description: "Where the car is parked. Customers pick it up at this branch.",
    options: [
      { value: "butuan", label: "Butuan" },
      { value: "cagayan-de-oro", label: "Cagayan de Oro" },
      { value: "davao", label: "Davao" },
    ],
  },
  { name: "seats", label: "Seats", type: "number", required: true, min: 2 },
  { name: "luggage", label: "Luggage (bags)", type: "number", required: true, min: 0 },
  { name: "daily_rate", label: "Base daily rate (PHP)", type: "number", required: true, min: 1, description: "Used when a zone has no rate below." },
  { name: "driver_rate", label: "Driver rate per day (PHP)", type: "number", required: true, min: 0 },
  {
    name: "zone_rates.local",
    label: "Rate: within the branch city",
    type: "number",
    nullable: true,
    min: 1,
    description: "Zones count from the car's branch. A CDO car: CDO City, Northern Mindanao, Butuan & Davao, rest of Mindanao.",
  },
  { name: "zone_rates.region", label: "Rate: within the branch region", type: "number", nullable: true, min: 1 },
  { name: "zone_rates.cities", label: "Rate: the other two branch cities", type: "number", nullable: true, min: 1 },
  { name: "zone_rates.mindanao", label: "Rate: Rest of Mindanao", type: "number", nullable: true, min: 1, description: "Leave zone rates blank to quote on request." },
  { name: "image_url", label: "Photo", type: "image", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "features", label: "Features", type: "list", description: "One feature per line, for example Rear camera." },
  { name: "slug", label: "URL slug", type: "text", nullable: true, description: SLUG_HELP },
  { name: "sort_order", label: "Sort order", type: "number", min: 0 },
  { name: "is_featured", label: "Show as popular", type: "switch" },
  { name: "is_active", label: "Available for booking", type: "switch" },
]

export function FleetManager() {
  const user = useAdminUser()
  // a branch owner adds and edits the cars kept at their branch; the API keeps them there
  const ownBranch = user.role === "owner" ? user.branch : null
  return (
    <ResourceManager<VehicleAdmin>
      title={ownBranch ? `${branchShort[ownBranch]} fleet` : "Fleet"}
      singular="Car"
      description={
        ownBranch
          ? `Add and edit the cars at your ${branchShort[ownBranch]} branch. Turn off "Available for booking" to hide a car from the website.`
          : "Add, price and retire cars. Hidden cars cannot be booked."
      }
      resource={resources.vehicles}
      fields={ownBranch ? vehicleFields.filter((f) => f.name !== "branch") : vehicleFields}
      canDelete={!ownBranch}
      defaults={{ year: 2024, branch: ownBranch ?? "butuan", category: "sedan", transmission: "automatic", fuel_type: "gasoline", seats: 5, luggage: 2, driver_rate: 1000, sort_order: 0, is_active: true, features: [] }}
      searchText={(v) => `${v.name} ${v.plate_number ?? ""} ${v.color ?? ""}`}
      itemLabel={(v) => v.name}
      deleteHint="Cars with booking history are hidden instead of deleted so past records stay intact."
      columns={[
        {
          header: "Car",
          cell: (v) => (
            <div className="flex items-center gap-3">
              <span className="car-panel relative h-10 w-16 shrink-0 rounded-md border">
                <Image src={v.image_url} alt="" fill sizes="64px" unoptimized={v.image_url.startsWith("/media/")} className="object-contain p-0.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{v.name}</p>
                <p className="text-xs text-muted-foreground">
                  {v.year} · {v.color ?? "No color"} {v.plate_number ? `· ${v.plate_number}` : ""}
                </p>
              </div>
            </div>
          ),
        },
        { header: "Type", cell: (v) => categoryLabels[v.category], className: "hidden md:table-cell" },
        { header: "Branch", cell: (v) => branchShort[v.branch] ?? v.branch, className: "hidden md:table-cell" },
        { header: "Seats", cell: (v) => v.seats, className: "hidden lg:table-cell" },
        { header: "Rate", cell: (v) => <span className="font-medium tabular-nums">{peso(v.daily_rate)}</span> },
        {
          header: "Status",
          cell: (v) => (
            <div className="flex gap-1.5">
              <ActiveBadge active={v.is_active} on="Available" off="Hidden" />
              {v.is_featured && <Badge>Popular</Badge>}
            </div>
          ),
        },
      ]}
    />
  )
}

// ---------- Blog ----------

const blogFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true, wide: true },
  { name: "excerpt", label: "Excerpt", type: "textarea", required: true, description: "Shown on cards and in search results. 10 to 400 characters." },
  { name: "content", label: "Article", type: "markdown", required: true, placeholder: "Write in Markdown. Use ## for headings and - for lists." },
  { name: "cover_image_url", label: "Cover image", type: "image", nullable: true },
  { name: "tags", label: "Tags", type: "list", description: "One tag per line, for example Travel." },
  { name: "author_name", label: "Author", type: "text", required: true },
  { name: "slug", label: "URL slug", type: "text", nullable: true, description: SLUG_HELP },
  { name: "is_published", label: "Published", type: "switch" },
]

export function BlogManager() {
  return (
    <ResourceManager<BlogPostAdmin>
      title="Blog"
      singular="Article"
      description="Write guides and news. Drafts stay hidden until you publish them."
      resource={resources.posts}
      fields={blogFields}
      defaults={{ author_name: "Alldrive Team", is_published: false, tags: [] }}
      searchText={(p) => `${p.title} ${p.tags.join(" ")}`}
      itemLabel={(p) => p.title}
      dialogClassName="sm:max-w-3xl"
      columns={[
        {
          header: "Article",
          cell: (p) => (
            <div className="max-w-md">
              <p className="truncate font-medium">{p.title}</p>
              <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
            </div>
          ),
        },
        { header: "Tags", cell: (p) => <span className="text-sm text-muted-foreground">{p.tags.join(", ")}</span>, className: "hidden lg:table-cell" },
        {
          header: "Published",
          cell: (p) => (p.published_at && p.is_published ? formatDate(p.published_at) : "Not yet"),
          className: "hidden md:table-cell",
        },
        { header: "Status", cell: (p) => <ActiveBadge active={p.is_published} on="Published" off="Draft" /> },
      ]}
    />
  )
}

// ---------- Services ----------

const serviceFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "icon", label: "Icon", type: "icon", required: true },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "highlights", label: "Highlights", type: "list", description: "One highlight per line." },
  { name: "price_from", label: "Price from (PHP)", type: "number", nullable: true, min: 0, description: "Leave blank to show Custom quote." },
  { name: "sort_order", label: "Sort order", type: "number", min: 0 },
  { name: "slug", label: "URL anchor", type: "text", nullable: true, description: SLUG_HELP },
  { name: "is_active", label: "Visible on website", type: "switch" },
]

export function ServicesManager() {
  return (
    <ResourceManager<Service>
      title="Services"
      singular="Service"
      description="The services listed on the website and home page."
      resource={resources.services}
      fields={serviceFields}
      defaults={{ icon: "car", sort_order: 0, is_active: true, highlights: [] }}
      searchText={(s) => `${s.title} ${s.summary}`}
      itemLabel={(s) => s.title}
      columns={[
        {
          header: "Service",
          cell: (s) => (
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-brand-strong">
                <ServiceIcon name={s.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{s.title}</p>
                <p className="max-w-sm truncate text-xs text-muted-foreground">{s.summary}</p>
              </div>
            </div>
          ),
        },
        { header: "From", cell: (s) => (s.price_from ? peso(s.price_from) : "Custom"), className: "hidden md:table-cell" },
        { header: "Order", cell: (s) => s.sort_order, className: "hidden md:table-cell" },
        { header: "Status", cell: (s) => <ActiveBadge active={s.is_active} /> },
      ]}
    />
  )
}

// ---------- Partners ----------

const partnerFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "category", label: "Category", type: "text", required: true, placeholder: "Hospitality" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "logo_url", label: "Logo", type: "image", nullable: true, description: "Small square logo." },
  { name: "image_url", label: "Photo", type: "image", nullable: true, description: "Wide photo or banner shown at the top of the card, for example the storefront." },
  { name: "website_url", label: "Website", type: "text", nullable: true, placeholder: "https://" },
  { name: "sort_order", label: "Sort order", type: "number", min: 0 },
  { name: "is_active", label: "Visible on website", type: "switch" },
]

export function PartnersManager() {
  return (
    <ResourceManager<Partner>
      title="Partners"
      singular="Partner"
      description="Businesses shown on the Trusted Partners page."
      resource={resources.partners}
      fields={partnerFields}
      defaults={{ sort_order: 0, is_active: true }}
      searchText={(p) => `${p.name} ${p.category}`}
      itemLabel={(p) => p.name}
      columns={[
        { header: "Partner", cell: (p) => <span className="font-medium">{p.name}</span> },
        { header: "Category", cell: (p) => p.category },
        { header: "Order", cell: (p) => p.sort_order, className: "hidden md:table-cell" },
        { header: "Status", cell: (p) => <ActiveBadge active={p.is_active} /> },
      ]}
    />
  )
}

// ---------- FAQs ----------

const faqFields: FieldDef[] = [
  { name: "question", label: "Question", type: "text", required: true, wide: true },
  { name: "answer", label: "Answer", type: "textarea", required: true },
  { name: "category", label: "Category", type: "text", required: true, placeholder: "Booking" },
  { name: "sort_order", label: "Sort order", type: "number", min: 0 },
  { name: "is_active", label: "Visible on website", type: "switch" },
]

export function FaqsManager() {
  return (
    <ResourceManager<Faq>
      title="FAQs"
      singular="Question"
      description="Questions shown on the FAQ page, grouped by category."
      resource={resources.faqs}
      fields={faqFields}
      defaults={{ category: "General", sort_order: 0, is_active: true }}
      searchText={(f) => `${f.question} ${f.answer} ${f.category}`}
      itemLabel={(f) => f.question}
      columns={[
        { header: "Question", cell: (f) => <p className="max-w-lg truncate font-medium">{f.question}</p> },
        { header: "Category", cell: (f) => f.category, className: "hidden md:table-cell" },
        { header: "Status", cell: (f) => <ActiveBadge active={f.is_active} /> },
      ]}
    />
  )
}
