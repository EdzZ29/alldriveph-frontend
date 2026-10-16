// "rates" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Car Rental Rates: Butuan, Cagayan de Oro and Davao Branches",
    description:
      "Daily car rental rates for our Butuan, Cagayan de Oro and Davao branches, by destination zone across Mindanao. Sedans from PHP 1,300 per day.",
  },
  header: {
    eyebrow: "Rates",
    title: "Simple rates. No surprises.",
    description:
      "Each branch has its own daily rates, set by how far you drive from it. Pick your branch and destination and the price is set, with no hidden fees at pickup.",
    cta: "Get an instant quote",
  },
  loadError: "Rates are taking a moment to load",
  tabsLabel: "Rates by branch",
  forBranch: "Rates for cars picked up at our {branch} branch",
  coverage: {
    eyebrow: "Coverage",
    title: "Where each rate applies",
    description: "Zones are counted from our {branch} branch. We drive anywhere in Mindanao.",
  },
  table: {
    zone: "Rate zone",
    ownRate: "has its own rate:",
    save: "Save {percent}%",
    saveOn: "on {days} days or more",
    driver: "Add a driver for {rate} per day",
    note: "Rates are per 24 hours and include VAT. Weekly and monthly rates available on request. Prices may vary on holidays and peak seasons.",
  },
  zoneFrom: "from {rate}/day",
}

const fil: typeof en = {
  meta: {
    title: "Presyo ng Car Rental: Mga Branch sa Butuan, Cagayan de Oro at Davao",
    description:
      "Araw-araw na presyo ng car rental sa aming mga branch sa Butuan, Cagayan de Oro at Davao, ayon sa destination zone sa buong Mindanao. Sedan mula PHP 1,300 kada araw.",
  },
  header: {
    eyebrow: "Presyo",
    title: "Simpleng presyo. Walang sorpresa.",
    description:
      "May sariling araw-araw na presyo ang bawat branch, batay sa layo ng biyahe mo mula rito. Piliin ang branch at destinasyon at nakatakda na ang presyo, walang nakatagong bayad sa pickup.",
    cta: "Kumuha ng instant quote",
  },
  loadError: "Medyo natatagalan ang pag-load ng presyo",
  tabsLabel: "Presyo ayon sa branch",
  forBranch: "Presyo para sa mga sasakyang kukunin sa aming {branch} branch",
  coverage: {
    eyebrow: "Sakop",
    title: "Kung saan umiiral ang bawat presyo",
    description: "Binibilang ang mga zone mula sa aming {branch} branch. Bumibiyahe kami kahit saan sa Mindanao.",
  },
  table: {
    zone: "Rate zone",
    ownRate: "ay may sariling presyo:",
    save: "Makatipid ng {percent}%",
    saveOn: "sa {days} araw o higit pa",
    driver: "Magdagdag ng driver sa halagang {rate} kada araw",
    note: "Kada 24 oras ang presyo at kasama na ang VAT. May lingguhan at buwanang presyo kapag hiniling. Maaaring magbago ang presyo tuwing holiday at peak season.",
  },
  zoneFrom: "mula {rate}/araw",
}

const ceb: typeof en = {
  meta: {
    title: "Presyo sa Car Rental: Mga Branch sa Butuan, Cagayan de Oro ug Davao",
    description:
      "Adlaw-adlaw nga presyo sa car rental sa among mga branch sa Butuan, Cagayan de Oro ug Davao, base sa destination zone sa tibuok Mindanao. Sedan gikan PHP 1,300 matag adlaw.",
  },
  header: {
    eyebrow: "Presyo",
    title: "Simple nga presyo. Walay sorpresa.",
    description:
      "Naay kaugalingong adlaw-adlaw nga presyo ang matag branch, base sa kalayo sa imong biyahe gikan niini. Pilia ang branch ug destinasyon ug klaro na ang presyo, walay tinagong bayad sa pickup.",
    cta: "Pagkuha og instant quote",
  },
  loadError: "Medyo dugay ma-load ang presyo",
  tabsLabel: "Presyo base sa branch",
  forBranch: "Presyo para sa mga sakyanan nga kuhaon sa among {branch} branch",
  coverage: {
    eyebrow: "Sakop",
    title: "Asa magamit ang matag presyo",
    description: "Giihap ang mga zone gikan sa among {branch} branch. Mobiyahe mi bisan asa sa Mindanao.",
  },
  table: {
    zone: "Rate zone",
    ownRate: "naay kaugalingong presyo:",
    save: "Makadaginot og {percent}%",
    saveOn: "sa {days} ka adlaw o labaw pa",
    driver: "Dugangi og driver sa {rate} matag adlaw",
    note: "Matag 24 oras ang presyo ug apil na ang VAT. Naay semanal ug binulan nga presyo kung pangayoon. Mahimong mausab ang presyo panahon sa holiday ug peak season.",
  },
  zoneFrom: "gikan {rate}/adlaw",
}

const messages = { en, fil, ceb }
export default messages
