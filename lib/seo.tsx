import { branches, type Branch } from "@/lib/branches"
import { site } from "@/lib/site"
import type { Vehicle } from "@/lib/types"

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString()

/** Renders schema.org structured data. Escapes "<" so content can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

export function branchSchema(branch: Branch) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": absoluteUrl(`/car-rental/${branch.slug}#business`),
    name: `${site.name} ${branch.shortCity}`,
    url: absoluteUrl(`/car-rental/${branch.slug}`),
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/logo-mark.png"),
    telephone: site.phone,
    email: site.email,
    priceRange: "PHP 1,300 to PHP 5,500 per day",
    currenciesAccepted: "PHP",
    paymentAccepted: "Cash, GCash, Maya, Bank transfer",
    address: {
      "@type": "PostalAddress",
      addressLocality: branch.city,
      addressRegion: branch.province,
      postalCode: branch.postalCode,
      addressCountry: "PH",
    },
    geo: { "@type": "GeoCoordinates", latitude: branch.geo.lat, longitude: branch.geo.lng },
    areaServed: [branch.city, branch.province, "Mindanao"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    parentOrganization: { "@id": absoluteUrl("/#organization") },
  }
}

export function organizationSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: site.name,
      alternateName: ["Alldrive PH", "Alldrive Rent a Car"],
      url: site.url,
      logo: absoluteUrl("/logo-mark.png"),
      email: site.email,
      telephone: site.phone,
      sameAs: Object.values(site.socials),
      department: branches.map((b) => ({ "@id": absoluteUrl(`/car-rental/${b.slug}#business`) })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: site.name,
      url: site.url,
      inLanguage: "en-PH",
      publisher: { "@id": absoluteUrl("/#organization") },
    },
  ]
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function vehicleSchema(vehicle: Vehicle) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.name,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    color: vehicle.color ?? undefined,
    vehicleTransmission: vehicle.transmission === "automatic" ? "Automatic" : "Manual",
    fuelType: vehicle.fuel_type,
    vehicleSeatingCapacity: vehicle.seats,
    image: absoluteUrl(vehicle.image_url),
    description: vehicle.description,
    url: absoluteUrl(`/fleet/${vehicle.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "PHP",
      price: vehicle.zone_rates?.local ?? vehicle.daily_rate,
      availability: "https://schema.org/InStock",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: vehicle.zone_rates?.local ?? vehicle.daily_rate,
        priceCurrency: "PHP",
        unitCode: "DAY",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
      },
      seller: { "@id": absoluteUrl("/#organization") },
    },
  }
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }
}
