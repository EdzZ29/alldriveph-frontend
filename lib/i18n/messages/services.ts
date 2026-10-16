// "services" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Car Rental Services: Self Drive, With Driver, Tours",
    description: "Self drive rentals, cars with driver, airport transfers, weddings, corporate fleets and out of town tours.",
  },
  header: {
    eyebrow: "Services",
    title: "Whatever the trip, we have you covered",
    description: "One team for daily rentals, chauffeured trips, events and business fleets. Clear pricing on every service.",
  },
  priceFrom: "From {price}",
  customQuote: "Custom quote",
  chooseCar: "Choose a car",
  askQuestion: "Ask a question",
}

const fil: typeof en = {
  meta: {
    title: "Mga Serbisyo sa Car Rental: Self Drive, May Driver, Tours",
    description: "Self drive na rental, sasakyang may driver, airport transfer, kasal, corporate fleet at mga biyahe palabas ng bayan.",
  },
  header: {
    eyebrow: "Serbisyo",
    title: "Anumang biyahe, sagot ka namin",
    description: "Iisang team para sa araw-araw na rental, biyaheng may driver, mga event at business fleet. Malinaw ang presyo sa bawat serbisyo.",
  },
  priceFrom: "Mula {price}",
  customQuote: "Custom na quote",
  chooseCar: "Pumili ng sasakyan",
  askQuestion: "Magtanong",
}

const ceb: typeof en = {
  meta: {
    title: "Mga Serbisyo sa Car Rental: Self Drive, Naay Driver, Tours",
    description: "Self drive nga rental, sakyanan nga naay driver, airport transfer, kasal, corporate fleet ug mga biyahe gawas sa siyudad.",
  },
  header: {
    eyebrow: "Serbisyo",
    title: "Bisan unsa nga biyahe, kami ang bahala",
    description: "Usa ra ka team para sa adlaw-adlaw nga rental, biyahe nga naay driver, mga event ug business fleet. Klaro ang presyo sa matag serbisyo.",
  },
  priceFrom: "Gikan {price}",
  customQuote: "Custom nga quote",
  chooseCar: "Pagpili og sakyanan",
  askQuestion: "Pangutana",
}

const messages = { en, fil, ceb }
export default messages
