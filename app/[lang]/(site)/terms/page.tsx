import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-page"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { site } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.legal.terms.title, description: t.legal.terms.metaDescription, alternates: alternatesFor(lang, "/terms") }
}

const content = `
These terms apply to every rental with ${site.name}. By submitting a booking you agree to them. The signed rental agreement you receive at pickup forms part of these terms.

## Eligibility

- Self drive renters must be at least 21 years old with at least two (2) years of driving experience.
- You must present a valid Philippine driver's license, or a valid foreign license with an international driving permit where required, plus two valid government IDs and proof of billing.
- We may decline a rental if documents cannot be verified.

## Bookings and confirmation

A booking submitted online is a request. It becomes confirmed once our team contacts you and you pay the reservation fee. Your booking reference lets you track its status at any time.

## Rates and payment

- Rates are per 24 hour period counted from the pickup time, inclusive of VAT.
- Rentals of 7 days or more receive a 10% discount on the base rate.
- For trips with a driver, the driver fee covers up to 10 hours per day. Overtime, fuel, tolls, parking and the driver's meals and lodging for overnight trips are charged at cost.
- The balance is due at pickup through cash, GCash, Maya or bank transfer.

## Security deposit

A refundable deposit of PHP 5,000 is collected at pickup for self drive rentals. It is returned after the car passes inspection, less any charges for fuel, late return, traffic violations, cleaning or damage.

## Fuel, mileage and use

- Cars are released with a full tank and must be returned full, otherwise refueling is charged at the current pump price plus a service fee.
- Mileage is unlimited within Mindanao. Travel to Visayas or Luzon requires prior written approval.
- Returning the car to a different branch (Butuan, Cagayan de Oro or Davao) must be arranged in advance.
- Smoking, carrying illegal items, ride hailing, sub renting and off road racing are prohibited.

## Late returns

A one (1) hour grace period applies. After that, an hourly rate is charged, and returns more than four (4) hours late are charged as an additional day.

## Cancellations and changes

- Free cancellation up to 48 hours before pickup.
- Cancellations within 48 hours, or no shows, may forfeit the reservation fee.
- Changes are subject to availability and may change the price.

## Insurance, accidents and damage

All cars carry comprehensive insurance. In case of an accident, call our hotline immediately and secure a police report. The renter is responsible for the insurance participation fee unless full coverage was added, and for damage caused by negligence, prohibited use or driving under the influence.

## Traffic violations

The renter is responsible for all traffic violations, fines and impound fees incurred during the rental period.

## Contact

For questions about these terms, contact us at [${site.email}](mailto:${site.email}) or ${site.phone}.
`

export default async function TermsPage() {
  const { t } = await getI18n()
  return  <LegalPage title={t.legal.terms.title} description={t.legal.terms.description} updated="2026-10-15" content={content} />
}
