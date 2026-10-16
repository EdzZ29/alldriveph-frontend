// "branches" translations for the city landing pages. Filipino and Cebuano must mirror the English keys exactly.
// English branch content (intro, trips, FAQs) lives in lib/branches.ts; here it is reused so it is not written twice.
import { branches } from "@/lib/branches"

type BranchText = {
  intro: string
  airportNote: string
  trips: { drive: string; text: string; car: string }[]
  faqs: { q: string; a: string }[]
}

const english: Record<string, BranchText> = Object.fromEntries(
  branches.map((b) => [
    b.slug,
    { intro: b.intro, airportNote: b.airport.note, trips: b.trips.map(({ drive, text, car }) => ({ drive, text, car })), faqs: b.faqs },
  ])
)

const en = {
  metaTitle: "Car Rental {city} | Self Drive and With Driver",
  metaDescription:
    "Rent a car in {city} from PHP 1,300 per day. Sedans, SUVs, 7 seaters and vans for self drive or with driver. Pickup in the city or at {airport}. Book online in minutes.",
  carRental: "Car rental {city}",
  heading: "Car rental in",
  cityPickup: "City pickup",
  cityPickupBody: "Door to door delivery within city limits is available.",
  airportBody: "Meet and greet at arrivals, {note}.",
  openDaily: "Open daily",
  availableIn: "Available in {city}",
  carsFor: "Cars for rent in {city}",
  carsDescription: "Sedans for city errands, seven seaters for families, pickups for cargo and vans for groups of up to 15.",
  seeAll: "See all cars",
  tripsEyebrow: "Road trip ideas",
  tripsTitle: "Popular drives from {city}",
  recommended: "Recommended: {car}",
  faqEyebrow: "FAQ",
  faqTitle: "Renting a car in {city}",
  moreAnswers: "More answers on our {link}.",
  faqLink: "FAQ page",
  others: "Our other branches",
  content: english,
}

const fil: typeof en = {
  metaTitle: "Car Rental {city} | Self Drive at May Driver",
  metaDescription:
    "Magrenta ng sasakyan sa {city} mula PHP 1,300 kada araw. Sedan, SUV, 7 seater at van para sa self drive o may driver. Pickup sa lungsod o sa {airport}. Mag-book online sa loob ng ilang minuto.",
  carRental: "Car rental {city}",
  heading: "Car rental sa",
  cityPickup: "Pickup sa lungsod",
  cityPickupBody: "May door to door delivery sa loob ng lungsod.",
  airportBody: "Sasalubungin ka namin sa arrivals, {note}.",
  openDaily: "Bukas araw-araw",
  availableIn: "Available sa {city}",
  carsFor: "Mga sasakyang paupahan sa {city}",
  carsDescription: "Sedan para sa lakad sa lungsod, seven seater para sa pamilya, pickup para sa kargamento at van para sa grupo na hanggang 15.",
  seeAll: "Tingnan lahat ng sasakyan",
  tripsEyebrow: "Mga ideya sa road trip",
  tripsTitle: "Mga sikat na biyahe mula {city}",
  recommended: "Inirerekomenda: {car}",
  faqEyebrow: "FAQ",
  faqTitle: "Pagrenta ng sasakyan sa {city}",
  moreAnswers: "Iba pang sagot sa aming {link}.",
  faqLink: "FAQ page",
  others: "Iba pa naming branch",
  content: {
    butuan: {
      intro:
        "Magrenta ng malinis at maayos na sasakyan sa Butuan City para sa self drive o may propesyonal na driver. Kunin sa lungsod o mismo sa Bancasi Airport at libutin ang Agusan at ang rehiyon ng Caraga ayon sa sarili mong schedule.",
      airportNote: "mga 10 minuto mula sa sentro ng lungsod",
      trips: [
        { drive: "Mga 4 na oras", text: "Ang sikat na asul na ilog sa Surigao del Sur. Umalis nang maaga para maunahan ang dami ng tao sa tanghali.", car: "Toyota Innova o Avanza" },
        { drive: "Mga 1 oras", text: "Ang ikaapat na pinakamalaking lawa sa bansa, magandang pang-day trip at sariwang seafood.", car: "Toyota Vios" },
        { drive: "Mga 2.5 oras", text: "Daanan papuntang Siargao at Dinagat. Bumiyahe sa baybayin at sumakay ng ferry mula sa pantalan.", car: "Nissan Terra o Fortuner" },
        { drive: "Sa loob ng lungsod", text: "Tuklasin ang kasaysayan ng Butuan bilang isa sa pinakamatandang daungan ng kalakalan sa Pilipinas.", car: "Kahit anong sedan" },
      ],
      faqs: [
        {
          q: "Puwede ba akong kumuha ng rental car sa Butuan airport?",
          a: "Oo. Piliin ang Butuan-Bancasi Airport bilang pickup location at sasalubungin ka ng aming staff sa arrivals dala ang sasakyan.",
        },
        {
          q: "Puwede ba akong bumiyahe mula Butuan papuntang Surigao o Davao?",
          a: "Oo. Puwedeng ibiyahe ang aming mga sasakyan kahit saan sa Mindanao. Puwedeng ayusin nang maaga ang pagsauli sa aming branch sa Davao o Cagayan de Oro.",
        },
        {
          q: "Magkano ang car rental sa Butuan kada araw?",
          a: "Sa loob ng Butuan City, nagsisimula sa PHP 1,300 kada araw ang sedan, PHP 1,800 ang MPV at PHP 2,500 ang SUV o pickup. Nakadepende ang presyo sa iyong destination zone, at makikita mo ang buong presyo sa booking form bago ka mag-confirm.",
        },
      ],
    },
    "cagayan-de-oro": {
      intro:
        "Magrenta ng sasakyan sa Cagayan de Oro para sa business trip, pagbisita sa pamilya o weekend drive papuntang Bukidnon. Self drive o may driver, may pickup sa lungsod o sa Laguindingan Airport.",
      airportNote: "mga 1 oras mula sa sentro ng lungsod",
      trips: [
        { drive: "Mga 2 oras", text: "Malamig na panahon, pine forest at adventure park sa kabundukan.", car: "Toyota Fortuner o Montero Sport" },
        { drive: "Mga 1.5 oras", text: "Bisitahin ang Maria Cristina at Tinago Falls sa City of Majestic Waterfalls.", car: "Toyota Vios" },
        {
          drive: "Mga 2 oras papuntang pantalan ng Balingoan",
          text: "Sumakay ng RoRo mula Balingoan papunta sa islang isinilang sa apoy. Sabihan kami nang maaga para maihanda namin ang mga dokumento.",
          car: "Toyota Innova",
        },
        { drive: "Mga 1 oras", text: "Malawak na luntiang taniman at ang sikat na Del Monte clubhouse sa Manolo Fortich.", car: "Kahit anong sedan o MPV" },
      ],
      faqs: [
        {
          q: "Puwede ba akong kumuha ng rental car sa Laguindingan Airport?",
          a: "Oo. Piliin ang Laguindingan Airport bilang pickup location. Sa mga booking na may driver, sinusubaybayan namin ang flight mo para naghihintay na ang driver pagdating mo.",
        },
        {
          q: "Puwede ko bang dalhin ang rental car sa Camiguin?",
          a: "Oo, basta may abiso nang maaga. Ihahanda namin ang mga dokumentong kailangan sa pagtawid sa RoRo mula sa pantalan ng Balingoan.",
        },
        {
          q: "May van ba kayong paupahan sa Cagayan de Oro?",
          a: "Oo. Kasya ang hanggang 15 pasahero sa aming Toyota Hiace at Nissan Urvan, at sikat ang mga ito para sa company outing at airport transfer.",
        },
      ],
    },
    davao: {
      intro:
        "Magrenta ng sasakyan sa Davao City at libutin ang pinakamalaking lungsod ng Mindanao sa sarili mong bilis. Self drive o may propesyonal na driver, may pickup sa downtown o sa Davao International Airport.",
      airportNote: "mga 20 minuto mula sa downtown",
      trips: [
        { drive: "Mga 1.5 oras", text: "Mountain resort na may hardin, malamig na hangin at zip line sa Toril.", car: "Toyota Vios o Avanza" },
        { drive: "Mga 1.5 oras", text: "Makita nang malapitan ang pambansang ibon sa Malagos, saka dumaan sa mga kalapit na farm.", car: "Kahit anong sedan" },
        { drive: "Ferry mula Sasa wharf", text: "Puting buhangin sa kabila lang ng gulf. Isakay ang sasakyan sa barge para madaling mag-island hopping.", car: "Toyota Innova" },
        { drive: "Mga 3.5 oras", text: "Mahabang puting buhanginan na kilala sa surfing at skimboarding sa Davao Oriental.", car: "Pickup o van para sa buong grupo" },
      ],
      faqs: [
        { q: "Puwede ba akong magrenta ng sasakyan sa Davao airport?", a: "Oo. Piliin ang Davao International Airport bilang pickup location at sasalubungin ka namin sa arrivals." },
        { q: "Puwede ko bang dalhin ang rental car sa Samal Island?", a: "Oo. Puwedeng tumawid ang sasakyan sa Samal Island sakay ng barge. Ang umuupa ang magbabayad ng ferry fee." },
        {
          q: "Puwede bang mag-self drive ang mga dayuhan sa Davao?",
          a: "Oo. Dalhin ang iyong passport at valid na driver's license, at international driving permit kung hindi English ang lisensya mo.",
        },
      ],
    },
  },
}

const ceb: typeof en = {
  metaTitle: "Car Rental {city} | Self Drive ug Naay Driver",
  metaDescription:
    "Pag-abang og sakyanan sa {city} gikan PHP 1,300 matag adlaw. Sedan, SUV, 7 seater ug van para sa self drive o naay driver. Pickup sa siyudad o sa {airport}. Pag-book online sulod sa pipila ka minuto.",
  carRental: "Car rental {city}",
  heading: "Car rental sa",
  cityPickup: "Pickup sa siyudad",
  cityPickupBody: "Naay door to door delivery sulod sa siyudad.",
  airportBody: "Sugaton ka namo sa arrivals, {note}.",
  openDaily: "Abri adlaw-adlaw",
  availableIn: "Available sa {city}",
  carsFor: "Mga sakyanan nga paabangan sa {city}",
  carsDescription: "Sedan para sa lakaw sa siyudad, seven seater para sa pamilya, pickup para sa karga ug van para sa grupo nga hangtod 15.",
  seeAll: "Tan-awa tanang sakyanan",
  tripsEyebrow: "Mga ideya sa road trip",
  tripsTitle: "Mga sikat nga biyahe gikan {city}",
  recommended: "Girekomenda: {car}",
  faqEyebrow: "FAQ",
  faqTitle: "Pag-abang og sakyanan sa {city}",
  moreAnswers: "Dugang tubag sa among {link}.",
  faqLink: "FAQ page",
  others: "Among ubang branch",
  content: {
    butuan: {
      intro:
        "Pag-abang og limpyo ug maayong sakyanan sa Butuan City para sa self drive o naay propesyonal nga driver. Kuhaa sa siyudad o mismo sa Bancasi Airport ug libota ang Agusan ug ang rehiyon sa Caraga sumala sa imong kaugalingong schedule.",
      airportNote: "mga 10 minutos gikan sa sentro sa siyudad",
      trips: [
        { drive: "Mga 4 ka oras", text: "Ang sikat nga asul nga suba sa Surigao del Sur. Biya og sayo aron maunahan ang daghang tawo sa udto.", car: "Toyota Innova o Avanza" },
        { drive: "Mga 1 ka oras", text: "Ang ikaupat nga pinakadakong lanaw sa nasud, nindot para sa day trip ug presko nga seafood.", car: "Toyota Vios" },
        { drive: "Mga 2.5 ka oras", text: "Agianan paingon sa Siargao ug Dinagat. Biyahe subay sa baybayon ug sakay sa ferry gikan sa pantalan.", car: "Nissan Terra o Fortuner" },
        { drive: "Sulod sa siyudad", text: "Diskubreha ang kasaysayan sa Butuan isip usa sa pinakakaraang pantalan sa pamatigayon sa Pilipinas.", car: "Bisan unsang sedan" },
      ],
      faqs: [
        {
          q: "Makakuha ba ko og rental car sa Butuan airport?",
          a: "Oo. Pilia ang Butuan-Bancasi Airport isip pickup location ug sugaton ka sa among staff sa arrivals dala ang sakyanan.",
        },
        {
          q: "Mahimo ba ko mobiyahe gikan Butuan paingon Surigao o Davao?",
          a: "Oo. Mahimong ibiyahe ang among mga sakyanan bisan asa sa Mindanao. Mahimong i-arrange daan ang pag-uli sa among branch sa Davao o Cagayan de Oro.",
        },
        {
          q: "Tagpila ang car rental sa Butuan matag adlaw?",
          a: "Sulod sa Butuan City, nagsugod sa PHP 1,300 matag adlaw ang sedan, PHP 1,800 ang MPV ug PHP 2,500 ang SUV o pickup. Depende ang presyo sa imong destination zone, ug makita nimo ang tibuok presyo sa booking form sa dili pa ka mo-confirm.",
        },
      ],
    },
    "cagayan-de-oro": {
      intro:
        "Pag-abang og sakyanan sa Cagayan de Oro para sa business trip, pagbisita sa pamilya o weekend drive paingon Bukidnon. Self drive o naay driver, nga naay pickup sa siyudad o sa Laguindingan Airport.",
      airportNote: "mga 1 ka oras gikan sa sentro sa siyudad",
      trips: [
        { drive: "Mga 2 ka oras", text: "Bugnaw nga panahon, pine forest ug adventure park sa kabukiran.", car: "Toyota Fortuner o Montero Sport" },
        { drive: "Mga 1.5 ka oras", text: "Bisitaha ang Maria Cristina ug Tinago Falls sa City of Majestic Waterfalls.", car: "Toyota Vios" },
        {
          drive: "Mga 2 ka oras paingon sa pantalan sa Balingoan",
          text: "Sakay sa RoRo gikan Balingoan paingon sa isla nga natawo sa kalayo. Sultihi mi daan aron maandam namo ang mga dokumento.",
          car: "Toyota Innova",
        },
        { drive: "Mga 1 ka oras", text: "Lapad nga lunhaw nga plantasyon ug ang sikat nga Del Monte clubhouse sa Manolo Fortich.", car: "Bisan unsang sedan o MPV" },
      ],
      faqs: [
        {
          q: "Makakuha ba ko og rental car sa Laguindingan Airport?",
          a: "Oo. Pilia ang Laguindingan Airport isip pickup location. Sa mga booking nga naay driver, among bantayan ang imong flight aron naghulat na ang driver pag-abot nimo.",
        },
        {
          q: "Mahimo ba nako dad-on ang rental car sa Camiguin?",
          a: "Oo, basta naay pahibalo daan. Among andamon ang mga dokumento nga kinahanglan sa pagtabok sa RoRo gikan sa pantalan sa Balingoan.",
        },
        {
          q: "Naa ba moy van nga paabangan sa Cagayan de Oro?",
          a: "Oo. Masudlan og hangtod 15 ka pasahero ang among Toyota Hiace ug Nissan Urvan, ug sikat kini para sa company outing ug airport transfer.",
        },
      ],
    },
    davao: {
      intro:
        "Pag-abang og sakyanan sa Davao City ug libota ang pinakadakong siyudad sa Mindanao sa imong kaugalingong dagan. Self drive o naay propesyonal nga driver, nga naay pickup sa downtown o sa Davao International Airport.",
      airportNote: "mga 20 minutos gikan sa downtown",
      trips: [
        { drive: "Mga 1.5 ka oras", text: "Mountain resort nga naay tanaman, bugnaw nga hangin ug zip line sa Toril.", car: "Toyota Vios o Avanza" },
        { drive: "Mga 1.5 ka oras", text: "Tan-awa sa duol ang nasudnong langgam sa Malagos, unya agi sa duol nga mga farm.", car: "Bisan unsang sedan" },
        { drive: "Ferry gikan Sasa wharf", text: "Puti nga balas tabok ra sa gulf. Isakay ang sakyanan sa barge para sayon ang island hopping.", car: "Toyota Innova" },
        { drive: "Mga 3.5 ka oras", text: "Taas nga puti nga baybayon nga ilado sa surfing ug skimboarding sa Davao Oriental.", car: "Pickup o van para sa tibuok grupo" },
      ],
      faqs: [
        { q: "Makaabang ba ko og sakyanan sa Davao airport?", a: "Oo. Pilia ang Davao International Airport isip pickup location ug sugaton ka namo sa arrivals." },
        { q: "Mahimo ba nako dad-on ang rental car sa Samal Island?", a: "Oo. Mahimong motabok ang sakyanan sa Samal Island sakay sa barge. Ang nag-abang ang mobayad sa ferry fee." },
        {
          q: "Pwede ba mag-self drive ang mga langyaw sa Davao?",
          a: "Oo. Dad-a ang imong passport ug valid nga driver's license, ug international driving permit kung dili English ang imong lisensya.",
        },
      ],
    },
  },
}

const messages = { en, fil, ceb }
export default messages
