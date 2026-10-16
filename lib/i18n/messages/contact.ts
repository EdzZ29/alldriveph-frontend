// "contact" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Contact us",
    description: "Questions about a rental, a partnership or a corporate account? Message or call the Alldrive team.",
  },
  header: {
    eyebrow: "Contact",
    title: "We are happy to help",
    description: "Send us a message and a real person will get back to you, usually within the hour.",
  },
  /** keyed by the branch name in lib/site */
  branchAreas: {
    Butuan: "Butuan City and Bancasi Airport",
    "Cagayan de Oro": "CDO City and Laguindingan Airport",
    Davao: "Davao City and Davao International Airport",
  } as Record<string, string>,
  channels: {
    callOrText: "Call or text",
    email: "Email",
    mainOffice: "Main office",
    hours: "Hours",
    emergencies: "Emergencies",
    hotline: "24/7 roadside assistance for active rentals",
  },
  form: {
    name: "Name",
    email: "Email",
    mobile: "Mobile",
    optional: "(optional)",
    subject: "Subject",
    message: "Message",
    send: "Send message",
    sentTitle: "Message sent",
    sentBody: "Thanks for reaching out. We usually reply within an hour during business hours.",
    sendAnother: "Send another message",
    failed: "Message not sent. Please try again.",
    errors: {
      name: "Please enter your name",
      email: "Please enter a valid email",
      subject: "Please add a subject",
      message: "Please write at least 10 characters",
    },
  },
}

const fil: typeof en = {
  meta: {
    title: "Makipag-ugnayan sa amin",
    description: "May tanong tungkol sa renta, partnership o corporate account? Mag-message o tumawag sa Alldrive team.",
  },
  header: {
    eyebrow: "Kontak",
    title: "Masaya kaming tumulong",
    description: "Padalhan kami ng mensahe at isang totoong tao ang sasagot sa iyo, kadalasan sa loob ng isang oras.",
  },
  branchAreas: {
    Butuan: "Butuan City at Bancasi Airport",
    "Cagayan de Oro": "CDO City at Laguindingan Airport",
    Davao: "Davao City at Davao International Airport",
  },
  channels: {
    callOrText: "Tumawag o mag-text",
    email: "Email",
    mainOffice: "Pangunahing opisina",
    hours: "Oras ng serbisyo",
    emergencies: "Emergency",
    hotline: "24/7 na tulong sa daan para sa aktibong renta",
  },
  form: {
    name: "Pangalan",
    email: "Email",
    mobile: "Mobile",
    optional: "(opsyonal)",
    subject: "Paksa",
    message: "Mensahe",
    send: "Ipadala ang mensahe",
    sentTitle: "Naipadala ang mensahe",
    sentBody: "Salamat sa pakikipag-ugnayan. Karaniwan kaming sumasagot sa loob ng isang oras sa oras ng trabaho.",
    sendAnother: "Magpadala ng isa pang mensahe",
    failed: "Hindi naipadala ang mensahe. Pakisubukang muli.",
    errors: {
      name: "Pakilagay ang iyong pangalan",
      email: "Pakilagay ang tamang email",
      subject: "Pakilagay ang paksa",
      message: "Pakisulat ng hindi bababa sa 10 character",
    },
  },
}

const ceb: typeof en = {
  meta: {
    title: "Kontaka mi",
    description: "Naay pangutana bahin sa abang, partnership o corporate account? Mag-message o tawag sa Alldrive team.",
  },
  header: {
    eyebrow: "Kontak",
    title: "Malipay mi nga motabang",
    description: "Padalhi mi og mensahe ug usa ka tinuod nga tawo ang motubag nimo, kasagaran sulod sa usa ka oras.",
  },
  branchAreas: {
    Butuan: "Butuan City ug Bancasi Airport",
    "Cagayan de Oro": "CDO City ug Laguindingan Airport",
    Davao: "Davao City ug Davao International Airport",
  },
  channels: {
    callOrText: "Tawag o text",
    email: "Email",
    mainOffice: "Punoang opisina",
    hours: "Oras sa serbisyo",
    emergencies: "Emergency",
    hotline: "24/7 nga tabang sa dalan para sa aktibo nga abang",
  },
  form: {
    name: "Ngalan",
    email: "Email",
    mobile: "Mobile",
    optional: "(opsyonal)",
    subject: "Hilisgutan",
    message: "Mensahe",
    send: "Ipadala ang mensahe",
    sentTitle: "Napadala ang mensahe",
    sentBody: "Salamat sa pagkontak. Kasagaran motubag mi sulod sa usa ka oras sa oras sa trabaho.",
    sendAnother: "Padala og laing mensahe",
    failed: "Wala mapadala ang mensahe. Palihug sulayi pag-usab.",
    errors: {
      name: "Palihug isulat ang imong ngalan",
      email: "Palihug isulat ang sakto nga email",
      subject: "Palihug butangi og hilisgutan",
      message: "Palihug pagsulat og labing menos 10 ka character",
    },
  },
}

const messages = { en, fil, ceb }
export default messages
