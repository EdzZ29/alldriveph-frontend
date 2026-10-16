// "home" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  hero: {
    eyebrow: "Car rental across Mindanao",
    headline: { line1: "Mindanao is", line2: "yours to drive." },
    body: "Self drive or with a professional driver. Clean, well kept sedans, MPVs, SUVs, pickups and vans for city errands, airport runs and road trips from Caraga to Davao. Daily, weekly or monthly.",
    carAlts: { commuter: "Toyota Hiace Commuter van", avanza: "Toyota Avanza", hilux: "Toyota Hilux pickup" },
  },
  quote: {
    eyebrow: "Instant quote",
    title: "Where and when?",
    description: "See every car that is free for your dates.",
  },
  valueProps: [
    { title: "Clean and inspected", text: "Sanitized and checked before every release." },
    { title: "Clear pricing", text: "Full price shown before you book." },
    { title: "Open 24/7", text: "Real people answer, day or night." },
    { title: "City or airport", text: "Pickup in Butuan, CDO and Davao." },
  ],
  fleet: {
    eyebrow: "Our fleet",
    titleLine1: "Pick a car.",
    titleLine2: "We take care of the rest.",
    description: "Well kept cars, from the Toyota Vios to the Hiace GL Grandia. Sanitized and ready for any trip across Mindanao.",
    action: "Check availability",
    loadError: "Our fleet is taking a moment to load",
  },
  options: {
    eyebrow: "Rental options",
    title: "How would you like to travel?",
    description: "Drive yourself, ride with a professional driver, or bring the whole group on a tour.",
  },
  rates: {
    eyebrow: "Rates",
    titleLine1: "Simple rates,",
    titleLine2: "no surprises.",
    description: "Daily self drive rates by destination zone.",
    action: "See where each rate applies",
    loadError: "Rates are taking a moment to load",
  },
  branches: {
    eyebrow: "Our branches",
    title: "Three cities. One easy booking.",
    description: "Pick up in the city or straight from the airport in Butuan, Cagayan de Oro and Davao.",
    pickup: "City pickup and {airport} ({code})",
    link: "Car rental {city}",
    soonText: "Opening soon. Message us and we will tell you when bookings open.",
    soonCta: "Ask about {city}",
  },
  how: {
    eyebrow: "How it works",
    title: "Booked in under five minutes",
    steps: [
      { title: "Choose your car", text: "Filter by size and dates to see only what is free for your trip." },
      { title: "Book in minutes", text: "Pick your destination and get a booking reference instantly. No payment yet." },
      { title: "Pick up and go", text: "We confirm within the hour. Show your license and IDs and the keys are yours." },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "More than a car rental",
    description: "Airport transfers, weddings, corporate fleets and out of town tours, handled by one team.",
    action: "All services",
    customQuote: "Custom quote",
  },
  partners: {
    eyebrow: "Trusted partners",
    title: "Working with businesses we trust",
    action: "Meet our partners",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions before you book?",
    introBefore: "Here are the ones we hear most. Still unsure? Call",
    introAfter: ", we are open 24/7.",
    action: "All questions",
  },
  blog: {
    eyebrow: "From the blog",
    title: "Tips for smoother trips",
    action: "Read the blog",
  },
  rentalOptions: {
    selfDrive: {
      title: "Self Drive Car Rental",
      text: "Pick your car, grab the keys and explore on your own terms. Drive anywhere in Mindanao.",
      from: "From PHP 1,300 / day",
    },
    withDriver: {
      title: "With Driver Car Rental",
      text: "Sit back while a professional, licensed driver handles the road, traffic and parking for you.",
      from: "Add a driver for PHP 1,000 / day",
    },
    tours: {
      title: "Travel and Tours",
      text: "Group trips, airport transfers and out of town tours in comfortable vans with an experienced driver.",
      from: "Vans for up to 15 guests",
    },
  },
  cta: {
    eyebrow: "Ready when you are",
    titleLine1: "Your next trip",
    titleLine2: "starts here.",
    body: "Reserve online in minutes and pay after we confirm. Real people answer, day or night.",
    quote: "Get a quote",
    message: "Send a message",
  },
}

const fil: typeof en = {
  hero: {
    eyebrow: "Car rental sa buong Mindanao",
    headline: { line1: "Libutin ang Mindanao,", line2: "ikaw ang driver." },
    body: "Self drive o may propesyonal na driver. Malinis at alagang sedan, MPV, SUV, pickup at van para sa lakad sa siyudad, hatid sa airport at road trip mula Caraga hanggang Davao. Arawan, lingguhan o buwanan.",
    carAlts: { commuter: "Toyota Hiace Commuter van", avanza: "Toyota Avanza", hilux: "Toyota Hilux pickup" },
  },
  quote: {
    eyebrow: "Instant quote",
    title: "Saan at kailan?",
    description: "Makikita mo ang lahat ng sasakyang bakante sa mga petsa mo.",
  },
  valueProps: [
    { title: "Malinis at nasuri", text: "Na-sanitize at chine-check bago ibigay sa iyo." },
    { title: "Malinaw na presyo", text: "Kita mo ang buong presyo bago ka mag-book." },
    { title: "Bukas 24/7", text: "Totoong tao ang sumasagot, araw man o gabi." },
    { title: "Siyudad o airport", text: "Pickup sa Butuan, CDO at Davao." },
  ],
  fleet: {
    eyebrow: "Aming mga sasakyan",
    titleLine1: "Pumili ng sasakyan.",
    titleLine2: "Kami na ang bahala sa iba.",
    description: "Alagang mga sasakyan, mula Toyota Vios hanggang Hiace GL Grandia. Na-sanitize at handa sa kahit anong biyahe sa Mindanao.",
    action: "Tingnan kung available",
    loadError: "Medyo natatagalan mag-load ang aming mga sasakyan",
  },
  options: {
    eyebrow: "Paraan ng pag-rent",
    title: "Paano mo gustong bumiyahe?",
    description: "Ikaw ang magmaneho, sumakay kasama ang propesyonal na driver, o isama ang buong grupo sa isang tour.",
  },
  rates: {
    eyebrow: "Presyo",
    titleLine1: "Simpleng presyo,",
    titleLine2: "walang sorpresa.",
    description: "Arawang self drive rate ayon sa zone ng destinasyon.",
    action: "Tingnan kung saan sakop ang bawat rate",
    loadError: "Medyo natatagalan mag-load ang mga presyo",
  },
  branches: {
    eyebrow: "Aming mga sangay",
    title: "Tatlong siyudad. Isang madaling booking.",
    description: "Mag-pickup sa siyudad o diretso sa airport sa Butuan, Cagayan de Oro at Davao.",
    pickup: "Pickup sa siyudad at sa {airport} ({code})",
    link: "Car rental sa {city}",
    soonText: "Malapit nang magbukas. Mag-message sa amin at sasabihan ka namin kapag puwede nang mag-book.",
    soonCta: "Magtanong tungkol sa {city}",
  },
  how: {
    eyebrow: "Paano mag-book",
    title: "Booked na sa loob ng limang minuto",
    steps: [
      { title: "Pumili ng sasakyan", text: "I-filter ayon sa laki at petsa para makita lang ang bakante para sa biyahe mo." },
      { title: "Mag-book agad", text: "Piliin ang destinasyon at makakuha agad ng booking reference. Wala pang bayad." },
      { title: "Kunin at bumiyahe na", text: "Kinukumpirma namin sa loob ng isang oras. Ipakita ang lisensya at mga ID mo, at sa iyo na ang susi." },
    ],
  },
  services: {
    eyebrow: "Mga serbisyo",
    title: "Higit pa sa car rental",
    description: "Airport transfer, kasalan, corporate fleet at out of town tour, hawak ng iisang team.",
    action: "Lahat ng serbisyo",
    customQuote: "Custom na quote",
  },
  partners: {
    eyebrow: "Mga pinagkakatiwalaang partner",
    title: "Katuwang ang mga negosyong pinagkakatiwalaan namin",
    action: "Kilalanin ang aming mga partner",
  },
  faq: {
    eyebrow: "FAQ",
    title: "May tanong bago mag-book?",
    introBefore: "Ito ang mga madalas naming marinig. May tanong ka pa? Tumawag sa",
    introAfter: ", bukas kami 24/7.",
    action: "Lahat ng tanong",
  },
  blog: {
    eyebrow: "Mula sa blog",
    title: "Mga tip para sa mas maayos na biyahe",
    action: "Basahin ang blog",
  },
  rentalOptions: {
    selfDrive: {
      title: "Self Drive na Car Rental",
      text: "Pumili ng sasakyan, kunin ang susi at maglibot ayon sa gusto mo. Mag-drive kahit saan sa Mindanao.",
      from: "Mula PHP 1,300 / araw",
    },
    withDriver: {
      title: "Car Rental na May Driver",
      text: "Mag-relax ka lang habang ang propesyonal at lisensyadong driver ang bahala sa daan, trapik at parking.",
      from: "Magdagdag ng driver sa PHP 1,000 / araw",
    },
    tours: {
      title: "Travel at Tours",
      text: "Group trip, airport transfer at out of town tour sakay ng komportableng van na may bihasang driver.",
      from: "Van para sa hanggang 15 pasahero",
    },
  },
  cta: {
    eyebrow: "Handa kami kapag handa ka na",
    titleLine1: "Ang susunod mong biyahe,",
    titleLine2: "dito nagsisimula.",
    body: "Mag-reserve online sa loob ng ilang minuto at magbayad pagkatapos naming kumpirmahin. Totoong tao ang sumasagot, araw man o gabi.",
    quote: "Kumuha ng quote",
    message: "Magpadala ng mensahe",
  },
}

const ceb: typeof en = {
  hero: {
    eyebrow: "Car rental sa tibuok Mindanao",
    headline: { line1: "Libuta ang Mindanao,", line2: "ikaw ang driver." },
    body: "Self drive o naay propesyonal nga driver. Limpyo ug maayong pagkaatiman nga sedan, MPV, SUV, pickup ug van para sa lakaw sa siyudad, hatod sa airport ug road trip gikan Caraga hangtod Davao. Adlawan, semanahan o bulanan.",
    carAlts: { commuter: "Toyota Hiace Commuter van", avanza: "Toyota Avanza", hilux: "Toyota Hilux pickup" },
  },
  quote: {
    eyebrow: "Instant quote",
    title: "Asa ug kanus-a?",
    description: "Makita nimo ang tanang sakyanan nga bakante sa imong mga petsa.",
  },
  valueProps: [
    { title: "Limpyo ug nasusi", text: "Gi-sanitize ug gi-check sa dili pa ihatag kanimo." },
    { title: "Klaro nga presyo", text: "Makita nimo ang tibuok presyo sa dili pa ka mag-book." },
    { title: "Abri 24/7", text: "Tinuod nga tawo ang motubag, adlaw man o gabii." },
    { title: "Siyudad o airport", text: "Pickup sa Butuan, CDO ug Davao." },
  ],
  fleet: {
    eyebrow: "Among mga sakyanan",
    titleLine1: "Pagpili og sakyanan.",
    titleLine2: "Kami na ang bahala sa uban.",
    description: "Maayong pagkaatiman nga mga sakyanan, gikan sa Toyota Vios hangtod sa Hiace GL Grandia. Gi-sanitize ug andam sa bisan unsang biyahe sa Mindanao.",
    action: "Tan-awa kung available",
    loadError: "Medyo dugay pa mo-load ang among mga sakyanan",
  },
  options: {
    eyebrow: "Klase sa pag-abang",
    title: "Unsa imong gusto nga biyahe?",
    description: "Ikaw ang mag-drive, sakay uban ang propesyonal nga driver, o dad-a ang tibuok grupo sa usa ka tour.",
  },
  rates: {
    eyebrow: "Presyo",
    titleLine1: "Simple nga presyo,",
    titleLine2: "walay surpresa.",
    description: "Adlaw-adlaw nga self drive rate base sa zone sa destinasyon.",
    action: "Tan-awa kung asa sakop ang matag rate",
    loadError: "Medyo dugay pa mo-load ang mga presyo",
  },
  branches: {
    eyebrow: "Among mga sanga",
    title: "Tulo ka siyudad. Usa ka sayon nga booking.",
    description: "Pag-pickup sa siyudad o diretso sa airport sa Butuan, Cagayan de Oro ug Davao.",
    pickup: "Pickup sa siyudad ug sa {airport} ({code})",
    link: "Car rental sa {city}",
    soonText: "Hapit na moabli. Mag-message sa amo ug sultihan ka namo kung pwede na mag-book.",
    soonCta: "Pangutana bahin sa {city}",
  },
  how: {
    eyebrow: "Unsaon pag-book",
    title: "Booked na sulod sa lima ka minuto",
    steps: [
      { title: "Pilia ang imong sakyanan", text: "I-filter base sa gidak-on ug petsa aron makita ra ang bakante para sa imong biyahe." },
      { title: "Pag-book dayon", text: "Pilia ang destinasyon ug makakuha dayon og booking reference. Wala pay bayad." },
      { title: "Kuhaa ug biyahe na", text: "Kumpirmahon namo sulod sa usa ka oras. Ipakita ang imong lisensya ug mga ID, ug imo na ang yawi." },
    ],
  },
  services: {
    eyebrow: "Mga serbisyo",
    title: "Labaw pa sa car rental",
    description: "Airport transfer, kasal, corporate fleet ug out of town tour, gidumala sa usa ra ka team.",
    action: "Tanang serbisyo",
    customQuote: "Custom nga quote",
  },
  partners: {
    eyebrow: "Kasaligang mga partner",
    title: "Kauban ang mga negosyo nga among gisaligan",
    action: "Ilaila ang among mga partner",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Naay pangutana sa dili pa mag-book?",
    introBefore: "Mao ni ang kasagarang pangutana nga among madungog. Naa pa kay pangutana? Tawag sa",
    introAfter: ", abri mi 24/7.",
    action: "Tanang pangutana",
  },
  blog: {
    eyebrow: "Gikan sa blog",
    title: "Mga tip para sa mas hapsay nga biyahe",
    action: "Basaha ang blog",
  },
  rentalOptions: {
    selfDrive: {
      title: "Self Drive nga Car Rental",
      text: "Pilia ang imong sakyanan, kuhaa ang yawi ug libot sumala sa imong gusto. Drive bisan asa sa Mindanao.",
      from: "Gikan PHP 1,300 / adlaw",
    },
    withDriver: {
      title: "Car Rental nga Naay Driver",
      text: "Relax lang samtang ang propesyonal ug lisensyado nga driver ang bahala sa dalan, trapiko ug parking.",
      from: "Pagdugang og driver sa PHP 1,000 / adlaw",
    },
    tours: {
      title: "Travel ug Tours",
      text: "Group trip, airport transfer ug out of town tour sakay sa komportable nga van nga naay batid nga driver.",
      from: "Van para sa hangtod 15 ka pasahero",
    },
  },
  cta: {
    eyebrow: "Andam mi kung andam na ka",
    titleLine1: "Ang imong sunod nga biyahe,",
    titleLine2: "diri magsugod.",
    body: "Pag-reserve online sulod sa pipila ka minuto ug bayad human namo makumpirma. Tinuod nga tawo ang motubag, adlaw man o gabii.",
    quote: "Pagkuha og quote",
    message: "Padala og mensahe",
  },
}

const messages = { en, fil, ceb }
export default messages
