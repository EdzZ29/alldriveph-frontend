// "blog" translations. Filipino and Cebuano must mirror the English keys exactly.
const en = {
  meta: {
    title: "Mindanao Road Trip Guides and Car Rental Tips",
    description: "Road trip ideas, rental guides and travel tips for driving around the Philippines.",
  },
  header: {
    eyebrow: "Blog",
    title: "Guides and road trip ideas",
    description: "Practical tips for renting, driving and exploring the Philippines by car.",
  },
  empty: { title: "No articles yet", body: "Check back soon for guides and travel tips." },
  taggedWith: "Showing articles tagged {tag}.",
  pagination: { label: "Pagination", previous: "Previous", next: "Next", pageOf: "Page {page} of {pages}" },
  allArticles: "All articles",
  articleNotFound: "Article not found",
  breadcrumbHome: "Home",
}

const fil: typeof en = {
  meta: {
    title: "Mga Gabay sa Road Trip sa Mindanao at Tips sa Car Rental",
    description: "Mga ideya sa road trip, gabay sa pag-renta at travel tips sa pagmamaneho sa buong Pilipinas.",
  },
  header: {
    eyebrow: "Blog",
    title: "Mga gabay at ideya sa road trip",
    description: "Praktikal na tips sa pag-renta, pagmamaneho at paglilibot sa Pilipinas gamit ang sasakyan.",
  },
  empty: { title: "Wala pang artikulo", body: "Bumalik ka ulit sa susunod para sa mga gabay at travel tips." },
  taggedWith: "Ipinapakita ang mga artikulong may tag na {tag}.",
  pagination: { label: "Mga pahina", previous: "Nakaraan", next: "Susunod", pageOf: "Pahina {page} ng {pages}" },
  allArticles: "Lahat ng artikulo",
  articleNotFound: "Hindi makita ang artikulo",
  breadcrumbHome: "Home",
}

const ceb: typeof en = {
  meta: {
    title: "Mga Giya sa Road Trip sa Mindanao ug Tips sa Car Rental",
    description: "Mga ideya sa road trip, giya sa pag-abang ug travel tips sa pagdrayb sa tibuok Pilipinas.",
  },
  header: {
    eyebrow: "Blog",
    title: "Mga giya ug ideya sa road trip",
    description: "Praktikal nga tips sa pag-abang, pagdrayb ug paglibot sa Pilipinas gamit ang sakyanan.",
  },
  empty: { title: "Wala pay artikulo", body: "Balik lang usab sunod para sa mga giya ug travel tips." },
  taggedWith: "Gipakita ang mga artikulo nga naay tag nga {tag}.",
  pagination: { label: "Mga panid", previous: "Miagi", next: "Sunod", pageOf: "Panid {page} sa {pages}" },
  allArticles: "Tanang artikulo",
  articleNotFound: "Wala makit-i ang artikulo",
  breadcrumbHome: "Home",
}

const messages = { en, fil, ceb }
export default messages
