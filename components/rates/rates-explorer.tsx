"use client"

import { MapPinIcon } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { useState } from "react"

import { EASE_OUT } from "@/components/motion/reveal"
import { RatesTable, ZoneMap } from "@/components/rates/rates-section"
import { SectionHeading } from "@/components/site/page-header"
import { useI18n } from "@/components/i18n/provider"
import { branchShort } from "@/lib/branch-labels"
import { fmt } from "@/lib/i18n/config"
import type { BranchCode, Meta, VehicleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Rates differ per branch: tabs switch between the Butuan, CDO and Davao rate tables. */
export function RatesExplorer({ vehicles, meta, showMap = false }: { vehicles: VehicleSummary[]; meta: Meta; showMap?: boolean }) {
  const [branch, setBranch] = useState<BranchCode>(meta.branches[0]?.code ?? "butuan")
  const branchVehicles = vehicles.filter((v) => v.branch === branch)
  const zones = meta.zones[branch] ?? []
  const branchName = meta.branches.find((b) => b.code === branch)?.name ?? branch
  const { t } = useI18n()
  const r = t.rates
  const [before, after] = r.forBranch.split("{branch}")

  return (
    <div>
      <LayoutGroup id="rates-branch">
        <div role="tablist" aria-label={r.tabsLabel} className="mx-auto mb-8 grid w-fit grid-cols-3 gap-1.5 rounded-[1.4rem] border bg-card p-1.5">
          {meta.branches.map((b) => {
            const active = b.code === branch
            return (
              <button
                key={b.code}
                role="tab"
                aria-selected={active}
                onClick={() => setBranch(b.code)}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors sm:px-7",
                  active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="rates-branch-pill"
                    className="absolute inset-0 rounded-2xl bg-primary shadow-[0_8px_20px_-8px] shadow-primary/70"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <MapPinIcon className="relative size-4" />
                <span className="relative">{branchShort[b.code] ?? b.name}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={branch}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <p className="mb-5 text-center text-sm text-muted-foreground">
            {before}
            <strong className="text-foreground">{branchName}</strong>
            {after}
          </p>
          <RatesTable vehicles={branchVehicles} zones={zones} meta={meta} />
          {showMap && (
            <div className="mt-24">
              <SectionHeading
                align="center"
                eyebrow={r.coverage.eyebrow}
                title={r.coverage.title}
                description={fmt(r.coverage.description, { branch: branchName })}
              />
              <div className="mt-12">
                <ZoneMap zones={zones} vehicles={branchVehicles} />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
