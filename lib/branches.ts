// Branch landing page content. Location codes must match PICKUP_LOCATIONS in the API.

export interface Branch {
  slug: string
  city: string
  shortCity: string
  province: string
  postalCode: string
  locationCodes: string[]
  airport: { name: string; code: string; note: string }
  intro: string
  keywords: string[]
  geo: { lat: number; lng: number }
  trips: { name: string; drive: string; text: string; car: string }[]
  faqs: { q: string; a: string }[]
}

export const branches: Branch[] = [
  {
    slug: "butuan",
    city: "Butuan City",
    shortCity: "Butuan",
    province: "Agusan del Norte",
    postalCode: "8600",
    locationCodes: ["butuan-city", "butuan-airport"],
    airport: { name: "Butuan-Bancasi Airport", code: "BXU", note: "about 10 minutes from the city center" },
    intro:
      "Rent a clean, well maintained car in Butuan City for self drive or with a professional driver. Pick up in the city or right at Bancasi Airport and explore Agusan and the Caraga region on your own schedule.",
    keywords: [
      "car rental Butuan",
      "rent a car Butuan City",
      "Butuan car rental",
      "self drive car rental Butuan",
      "car rental with driver Butuan",
      "Butuan airport car rental",
      "Bancasi airport car rental",
      "van rental Butuan",
      "car for rent Agusan del Norte",
      "Caraga car rental",
    ],
    geo: { lat: 8.9475, lng: 125.5406 },
    trips: [
      { name: "Enchanted River, Hinatuan", drive: "About 4 hours", text: "The famous deep blue river in Surigao del Sur. Leave early to beat the midday crowd.", car: "Toyota Innova or Avanza" },
      { name: "Lake Mainit", drive: "About 1 hour", text: "The fourth largest lake in the country, great for a relaxed day trip and fresh seafood.", car: "Toyota Vios" },
      { name: "Surigao City", drive: "About 2.5 hours", text: "Gateway to Siargao and Dinagat. Drive up the coast and catch the ferry from the port.", car: "Nissan Terra or Fortuner" },
      { name: "Balangay Shrine and museums", drive: "Within the city", text: "Discover Butuan's history as one of the oldest trading ports in the Philippines.", car: "Any sedan" },
    ],
    faqs: [
      { q: "Can I pick up a rental car at Butuan airport?", a: "Yes. Choose Butuan-Bancasi Airport as your pickup location and our staff will meet you at arrivals with the car." },
      { q: "Can I drive from Butuan to Surigao or Davao?", a: "Yes. Our cars can be driven anywhere in Mindanao. Returning to our Davao or Cagayan de Oro branch can be arranged in advance." },
      { q: "How much is a car rental in Butuan per day?", a: "Within Butuan City, sedans start at PHP 1,300 per day, MPVs at PHP 1,800 and SUVs or pickups at PHP 2,500. Rates depend on your destination zone, and the booking form shows the full price before you confirm." },
    ],
  },
  {
    slug: "cagayan-de-oro",
    city: "Cagayan de Oro City",
    shortCity: "Cagayan de Oro",
    province: "Misamis Oriental",
    postalCode: "9000",
    locationCodes: ["cagayan-de-oro-city", "laguindingan-airport"],
    airport: { name: "Laguindingan Airport", code: "CGY", note: "about 1 hour from the city center" },
    intro:
      "Rent a car in Cagayan de Oro for business trips, family visits or weekend drives to Bukidnon. Self drive or with a driver, with pickup in the city or at Laguindingan Airport.",
    keywords: [
      "car rental Cagayan de Oro",
      "rent a car CDO",
      "CDO car rental",
      "self drive car rental Cagayan de Oro",
      "car rental with driver CDO",
      "Laguindingan airport car rental",
      "van rental Cagayan de Oro",
      "car for rent Misamis Oriental",
      "Northern Mindanao car rental",
    ],
    geo: { lat: 8.4542, lng: 124.6319 },
    trips: [
      { name: "Dahilayan and Bukidnon highlands", drive: "About 2 hours", text: "Cool weather, pine forests and adventure parks up in the mountains.", car: "Toyota Fortuner or Montero Sport" },
      { name: "Iligan City waterfalls", drive: "About 1.5 hours", text: "Visit Maria Cristina and Tinago Falls in the City of Majestic Waterfalls.", car: "Toyota Vios" },
      { name: "Camiguin Island", drive: "About 2 hours to Balingoan port", text: "Take the RoRo from Balingoan to the island born of fire. Tell us ahead so we prepare the documents.", car: "Toyota Innova" },
      { name: "Del Monte pineapple plantations", drive: "About 1 hour", text: "Endless green fields and the famous Del Monte clubhouse in Manolo Fortich.", car: "Any sedan or MPV" },
    ],
    faqs: [
      { q: "Can I get a rental car at Laguindingan Airport?", a: "Yes. Select Laguindingan Airport as your pickup location. For with driver bookings we track your flight so your driver is waiting when you land." },
      { q: "Can I bring the rental car to Camiguin?", a: "Yes, with advance notice. We prepare the documents needed for the RoRo crossing from Balingoan port." },
      { q: "Do you have vans for rent in Cagayan de Oro?", a: "Yes. Our Toyota Hiace and Nissan Urvan vans seat up to 15 passengers and are popular for company outings and airport transfers." },
    ],
  },
  {
    slug: "davao",
    city: "Davao City",
    shortCity: "Davao",
    province: "Davao del Sur",
    postalCode: "8000",
    locationCodes: ["davao-city", "davao-airport"],
    airport: { name: "Davao International Airport", code: "DVO", note: "about 20 minutes from downtown" },
    intro:
      "Rent a car in Davao City and explore Mindanao's largest city at your own pace. Self drive or with a professional driver, with pickup downtown or at Davao International Airport.",
    keywords: [
      "car rental Davao",
      "rent a car Davao City",
      "Davao car rental",
      "self drive car rental Davao",
      "car rental with driver Davao",
      "Davao airport car rental",
      "van rental Davao",
      "car for rent Davao del Sur",
      "Southern Mindanao car rental",
    ],
    geo: { lat: 7.0731, lng: 125.6128 },
    trips: [
      { name: "Eden Nature Park", drive: "About 1.5 hours", text: "Mountain resort with gardens, cool air and zip lines up in Toril.", car: "Toyota Vios or Avanza" },
      { name: "Philippine Eagle Center", drive: "About 1.5 hours", text: "See the national bird up close in Malagos, then stop by the nearby farms.", car: "Any sedan" },
      { name: "Samal Island", drive: "Ferry from Sasa wharf", text: "White sand beaches just across the gulf. Take the car on the barge for easy island hopping.", car: "Toyota Innova" },
      { name: "Dahican Beach, Mati", drive: "About 3.5 hours", text: "Long white sand beach famous for surfing and skimboarding in Davao Oriental.", car: "Pickup or van for the whole group" },
    ],
    faqs: [
      { q: "Can I rent a car at Davao airport?", a: "Yes. Choose Davao International Airport as your pickup location and we will meet you at arrivals." },
      { q: "Can I take the rental car to Samal Island?", a: "Yes. Cars may cross to Samal Island on the barge. Ferry fees are paid by the renter." },
      { q: "Is self drive allowed for foreigners in Davao?", a: "Yes. Bring your passport and a valid driver's license, plus an international driving permit if your license is not in English." },
    ],
  },
]

export function getBranch(slug: string) {
  return branches.find((b) => b.slug === slug)
}

/** Branches opening soon: listed with a badge, but no landing page, booking or SEO entry until they open. */
export const upcomingBranches = [
  { slug: "surigao", shortCity: "Surigao", city: "Surigao City", province: "Surigao del Norte" },
  { slug: "zamboanga", shortCity: "Zamboanga", city: "Zamboanga City", province: "Zamboanga del Sur" },
]
