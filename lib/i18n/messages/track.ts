// "track" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Track your booking",
    description: "Check the status of your Alldrive car rental booking with your reference and email.",
  },
  header: {
    eyebrow: "Track booking",
    title: "Where is my booking?",
    description: "Enter the reference from your confirmation and the email you booked with.",
  },
  form: {
    reference: "Booking reference",
    email: "Email address",
    find: "Find booking",
    referenceError: "Enter the reference from your confirmation, for example AD-7K2Q9XM",
    emailError: "Enter the email you used when booking",
  },
  details: {
    reference: "Reference",
    car: "Car",
    pickup: "Pickup",
    return: "Return",
    service: "Service",
    total: "Total",
    cancelled: "This booking was cancelled.",
    pending: "We are reviewing your booking and will contact you shortly.",
    changes: "Need to make changes?",
    call: "Call",
    or: "or",
    message: "send us a message",
  },
}

const fil: typeof en = {
  meta: {
    title: "I-track ang iyong booking",
    description: "Alamin ang status ng iyong Alldrive car rental booking gamit ang iyong reference at email.",
  },
  header: {
    eyebrow: "I-track ang booking",
    title: "Nasaan na ang booking ko?",
    description: "Ilagay ang reference mula sa iyong kumpirmasyon at ang email na ginamit mo sa pag-book.",
  },
  form: {
    reference: "Reference ng booking",
    email: "Email address",
    find: "Hanapin ang booking",
    referenceError: "Ilagay ang reference mula sa iyong kumpirmasyon, halimbawa AD-7K2Q9XM",
    emailError: "Ilagay ang email na ginamit mo sa pag-book",
  },
  details: {
    reference: "Reference",
    car: "Sasakyan",
    pickup: "Pickup",
    return: "Pagbalik",
    service: "Serbisyo",
    total: "Kabuuan",
    cancelled: "Kinansela ang booking na ito.",
    pending: "Sinusuri namin ang iyong booking at kokontakin ka namin sa lalong madaling panahon.",
    changes: "May gusto kang baguhin?",
    call: "Tumawag sa",
    or: "o",
    message: "magpadala ng mensahe",
  },
}

const ceb: typeof en = {
  meta: {
    title: "I-track ang imong booking",
    description: "Susiha ang status sa imong Alldrive car rental booking gamit ang imong reference ug email.",
  },
  header: {
    eyebrow: "I-track ang booking",
    title: "Asa na akong booking?",
    description: "Isulat ang reference gikan sa imong kumpirmasyon ug ang email nga imong gigamit sa pag-book.",
  },
  form: {
    reference: "Reference sa booking",
    email: "Email address",
    find: "Pangitaa ang booking",
    referenceError: "Isulat ang reference gikan sa imong kumpirmasyon, pananglitan AD-7K2Q9XM",
    emailError: "Isulat ang email nga imong gigamit sa pag-book",
  },
  details: {
    reference: "Reference",
    car: "Sakyanan",
    pickup: "Pickup",
    return: "Pagbalik",
    service: "Serbisyo",
    total: "Kinatibuk-an",
    cancelled: "Gikansela kini nga booking.",
    pending: "Among gisusi ang imong booking ug kontakon ka namo dayon.",
    changes: "Naa kay gusto usbon?",
    call: "Tawag sa",
    or: "o",
    message: "padalhi mi og mensahe",
  },
}

const messages = { en, fil, ceb }
export default messages
