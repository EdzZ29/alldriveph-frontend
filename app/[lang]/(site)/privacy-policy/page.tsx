import type { Metadata } from "next"

import { LegalPage } from "@/components/site/legal-page"
import { alternatesFor } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import { site } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const { t, lang } = await getI18n()
  return { title: t.legal.privacy.title, description: t.legal.privacy.metaDescription, alternates: alternatesFor(lang, "/privacy-policy") }
}

const content = `
${site.name} ("Alldrive", "we", "us") respects your privacy. This policy explains what personal data we collect when you visit our website or rent a car, why we collect it, and the choices you have. We process personal data in accordance with the **Data Privacy Act of 2012 (Republic Act No. 10173)**, its Implementing Rules and Regulations, and issuances of the National Privacy Commission (NPC).

## Information we collect

**Information you give us**

- Booking details: your name, email address, mobile number, pickup and return schedule, locations, delivery address and any notes you add.
- Driver details for self drive rentals: driver's license number and, at pickup, copies of your license and two valid government IDs and proof of billing.
- Messages you send through our contact form, email, phone or social media.

**Information collected automatically**

- Technical data such as IP address, browser type, device information and pages visited, collected through server logs and essential cookies.
- Analytics data, only if you accept analytics cookies. See our [cookies policy](/cookies-policy).

We do not collect payment card numbers on this website.

## How we use your information

- To process, confirm, manage and support your booking.
- To verify driver eligibility and protect our vehicles against fraud and theft.
- To contact you about your booking, including reminders and changes.
- To respond to inquiries and provide customer support.
- To comply with legal obligations, such as tax, accounting and law enforcement requests.
- To improve our website and services using aggregated, non identifying data.

We will only send marketing messages if you have opted in, and you can opt out at any time.

## Legal basis for processing

We process your personal data because it is necessary to fulfill a contract with you (your rental), to comply with legal obligations, for our legitimate interests in running and securing our business, or because you have given consent, for example to analytics cookies.

## Sharing your information

We do not sell your personal data. We share it only when needed with:

- Our drivers and staff who handle your rental.
- Insurance providers in the event of an accident or claim.
- Service providers who host our website and systems, bound by data sharing or outsourcing agreements.
- Government authorities when required by law.

## Data retention

We keep booking records for as long as necessary for the purposes above and to meet legal and tax requirements, generally up to five (5) years after your rental. Contact messages are kept for up to two (2) years. Data no longer needed is securely deleted or anonymized.

## How we protect your data

We use organizational, physical and technical safeguards, including encrypted connections (HTTPS), access controls for staff, hashed administrator passwords and regular review of our systems. No method of transmission over the internet is completely secure, but we work hard to protect your information.

## Your rights as a data subject

Under the Data Privacy Act you have the right to:

- Be informed about how your personal data is processed.
- Access your personal data and obtain a copy.
- Correct inaccurate or incomplete data.
- Object to processing, or withdraw consent where processing is based on consent.
- Request erasure or blocking of data that is no longer necessary or unlawfully processed.
- Data portability, where applicable.
- Claim damages and file a complaint with the National Privacy Commission.

To exercise these rights, contact our Data Protection Officer using the details below. We may ask you to verify your identity first.

## Children's privacy

Our services are intended for adults. Drivers must be at least 21 years old. We do not knowingly collect personal data from children.

## Changes to this policy

We may update this policy from time to time. The latest version will always be posted on this page with the date it was last updated.

## Contact us

**Data Protection Officer**
${site.name}
${site.address}
Email: [${site.email}](mailto:${site.email})
Phone: ${site.phone}
`

export default async function PrivacyPolicyPage() {
  const { t } = await getI18n()
  return (
    <LegalPage
      title={t.legal.privacy.title} description={t.legal.privacy.description} updated="2026-10-15"
      content={content}
    />
  )
}
