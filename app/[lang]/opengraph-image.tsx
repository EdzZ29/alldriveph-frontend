import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { BRAND_DEEP } from "@/lib/brand"
import { site } from "@/lib/site"

export const alt = `${site.name}: car rental in Butuan, Cagayan de Oro and Davao`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-mark.png"))
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #f8fbff 0%, #eef6ff 60%, #e2f2ff 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={120} height={84} alt="" />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>Alldrive Rent a Car PH</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            Rent the right car, without the hassle.
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#475569" }}>
            Self drive or with driver in Butuan, Cagayan de Oro and Davao
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Butuan", "Cagayan de Oro", "Davao"].map((city) => (
            <div key={city} style={{ display: "flex", padding: "12px 24px", borderRadius: 999, background: BRAND_DEEP, color: "#fff", fontSize: 26, fontWeight: 600 }}>
              {city}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
