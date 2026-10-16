// Business details shown across the site.
export const site = {
  name: "Alldrive Rent a Car PH",
  shortName: "Alldrive",
  tagline: "Rent a car in Mindanao",
  description:
    "Self drive and chauffeured car rental in Butuan City, open 24 hours. Sedans, MPVs, SUVs, pickups and vans for trips across Caraga, Cagayan de Oro, Davao and all of Mindanao.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  phone: "0946 126 0177",
  phoneHref: "tel:+639461260177",
  phones: [
    { number: "0946 126 0177", href: "tel:+639461260177", network: "Smart" },
    { number: "0956 227 5764", href: "tel:+639562275764", network: "Globe" },
  ],
  email: "alldrivebtc@gmail.com",
  address: "P-5 Lower Doongan, Doongan, Butuan City, 8600 Agusan del Norte",
  shortAddress: "Doongan, Butuan City",
  directionsHref: "https://www.google.com/maps/search/?api=1&query=P-5+Lower+Doongan+Doongan+Butuan+City+Agusan+del+Norte",
  hours: "Open 24 hours, 7 days a week",
  branches: [
    { name: "Butuan", area: "Butuan City and Bancasi Airport" },
    { name: "Cagayan de Oro", area: "CDO City and Laguindingan Airport" },
    { name: "Davao", area: "Davao City and Davao International Airport" },
  ],
  hotline: "24/7 roadside assistance for active rentals",
  // Facebook and Messenger links need the page username; update them when ready
  chat: {
    viber: "viber://chat?number=%2B639461260177",
    whatsapp: "https://wa.me/639461260177",
    messenger: "https://m.me/",
  },
  socials: {
    facebook: "https://facebook.com/",
  },
} as const

export const mainNav = [
  { href: "/fleet", key: "fleet" },
  { href: "/rates", key: "rates" },
  { href: "/services", key: "services" },
  { href: "/partners", key: "partners" },
  { href: "/affiliate", key: "affiliate" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const

export const TIME_ZONE = "Asia/Manila"
export const TZ_OFFSET = "+08:00"
