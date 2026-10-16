// "faq" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Car Rental FAQ: Requirements, Rates and Deposits",
    description: "Requirements, pricing, deposits, cancellations and everything else about renting a car with Alldrive.",
  },
  header: {
    eyebrow: "FAQ",
    title: "Answers to common questions",
    description: "Everything you need to know about requirements, pricing and what to expect on the road.",
  },
  categoriesLabel: "FAQ categories",
  still: {
    title: "Still have a question?",
    body: "Our team usually replies within an hour during business hours.",
    call: "Call us",
    message: "Send a message",
  },
}

const fil: typeof en = {
  meta: {
    title: "FAQ sa Car Rental: Requirements, Presyo at Deposito",
    description: "Requirements, presyo, deposito, pagkansela at lahat ng dapat mong malaman sa pag-renta ng sasakyan sa Alldrive.",
  },
  header: {
    eyebrow: "FAQ",
    title: "Mga sagot sa karaniwang tanong",
    description: "Lahat ng kailangan mong malaman tungkol sa requirements, presyo at kung ano ang aasahan sa daan.",
  },
  categoriesLabel: "Mga kategorya ng FAQ",
  still: {
    title: "May tanong ka pa ba?",
    body: "Karaniwang sumasagot ang aming team sa loob ng isang oras tuwing business hours.",
    call: "Tumawag sa amin",
    message: "Magpadala ng mensahe",
  },
}

const ceb: typeof en = {
  meta: {
    title: "FAQ sa Car Rental: Requirements, Presyo ug Deposito",
    description: "Requirements, presyo, deposito, pagkansela ug tanan nga angay nimong mahibaloan sa pag-abang og sakyanan sa Alldrive.",
  },
  header: {
    eyebrow: "FAQ",
    title: "Mga tubag sa kasagarang pangutana",
    description: "Tanan nga kinahanglan nimong mahibaloan bahin sa requirements, presyo ug unsa ang madahom sa dalan.",
  },
  categoriesLabel: "Mga kategorya sa FAQ",
  still: {
    title: "Naa pa kay pangutana?",
    body: "Kasagaran motubag ang among team sulod sa usa ka oras panahon sa business hours.",
    call: "Tawagi mi",
    message: "Pagpadala og mensahe",
  },
}

const messages = { en, fil, ceb }
export default messages
