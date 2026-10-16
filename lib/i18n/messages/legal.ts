// "legal" translations. Only the page chrome is translated: the legal documents themselves stay in English
// until they get a professional translation. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  eyebrow: "Legal",
  lastUpdated: "Last updated {date}",
  onThisPage: "On this page",
  notice: {
    title: "",
    body: "",
    cta: "",
  },
  privacy: {
    title: "Privacy policy",
    metaDescription: "How Alldrive Rent a Car PH collects, uses and protects your personal data under the Data Privacy Act of 2012.",
    description: "How we collect, use and protect your personal information.",
  },
  cookies: {
    title: "Cookies policy",
    metaDescription: "Which cookies Alldrive Rent a Car PH uses, why, and how you can control them.",
    description: "What cookies we use and how you can control them.",
  },
  terms: {
    title: "Rental terms",
    metaDescription: "The terms and conditions that apply when you rent a car from Alldrive Rent a Car PH.",
    description: "The rules that keep every rental fair and simple.",
  },
}

const fil: typeof en = {
  eyebrow: "Legal",
  lastUpdated: "Huling na-update noong {date}",
  onThisPage: "Sa pahinang ito",
  notice: {
    title: "Nasa English ang opisyal na dokumento",
    body: "Ang opisyal na bersyon ng dokumentong ito ay nasa English. Kung may tanong ka tungkol dito, masaya kaming sagutin ito sa Filipino.",
    cta: "Magtanong sa amin",
  },
  privacy: {
    title: "Patakaran sa privacy",
    metaDescription: "Paano kinokolekta, ginagamit at pinoprotektahan ng Alldrive Rent a Car PH ang iyong personal na datos ayon sa Data Privacy Act of 2012.",
    description: "Paano namin kinokolekta, ginagamit at pinoprotektahan ang iyong personal na impormasyon.",
  },
  cookies: {
    title: "Patakaran sa cookies",
    metaDescription: "Anong cookies ang ginagamit ng Alldrive Rent a Car PH, bakit, at paano mo ito makokontrol.",
    description: "Anong cookies ang ginagamit namin at paano mo ito makokontrol.",
  },
  terms: {
    title: "Mga tuntunin sa pag-renta",
    metaDescription: "Ang mga tuntunin at kondisyon kapag umupa ka ng sasakyan sa Alldrive Rent a Car PH.",
    description: "Ang mga patakarang nagpapanatiling patas at simple ang bawat rental.",
  },
}

const ceb: typeof en = {
  eyebrow: "Legal",
  lastUpdated: "Katapusang na-update niadtong {date}",
  onThisPage: "Niining panid",
  notice: {
    title: "Naa sa English ang opisyal nga dokumento",
    body: "Ang opisyal nga bersyon niining dokumento naa sa English. Kung naa kay pangutana bahin niini, malipay kami nga motubag sa Bisaya.",
    cta: "Pangutana sa amo",
  },
  privacy: {
    title: "Palisiya sa privacy",
    metaDescription: "Giunsa pagkolekta, paggamit ug pagprotekta sa Alldrive Rent a Car PH sa imong personal nga datos subay sa Data Privacy Act of 2012.",
    description: "Giunsa namo pagkolekta, paggamit ug pagprotekta sa imong personal nga impormasyon.",
  },
  cookies: {
    title: "Palisiya sa cookies",
    metaDescription: "Unsang cookies ang gigamit sa Alldrive Rent a Car PH, ngano, ug unsaon nimo kini pagkontrol.",
    description: "Unsang cookies ang among gigamit ug unsaon nimo kini pagkontrol.",
  },
  terms: {
    title: "Mga lagda sa pag-abang",
    metaDescription: "Ang mga lagda ug kondisyon kung mag-abang ka og sakyanan sa Alldrive Rent a Car PH.",
    description: "Ang mga lagda nga nagpabiling patas ug simple sa matag rental.",
  },
}

const messages = { en, fil, ceb }
export default messages
