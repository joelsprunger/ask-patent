"use client"

import { useEffect, useRef } from "react"
import { PatentSectionData, SECTION_LABELS } from "@/types/patent-types"
import { cn } from "@/lib/utils"

interface SectionTocProps {
  sections: PatentSectionData[]
  activeSection: string | null
  scrollContainerId: string
}

export function SectionToc({
  sections,
  activeSection,
  scrollContainerId
}: SectionTocProps) {
  const activeLinkRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({ block: "nearest" })
  }, [activeSection])

  const scrollToSection = (sectionType: string) => {
    const container = document.getElementById(scrollContainerId)
    const target = document.getElementById(`section-${sectionType}`)
    if (!container || !target) return

    const containerTop = container.getBoundingClientRect().top
    const targetTop = target.getBoundingClientRect().top
    const offset = targetTop - containerTop + container.scrollTop - 16

    container.scrollTo({ top: offset, behavior: "smooth" })
  }

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-2">
        Contents
      </p>
      {sections.map(sec => {
        const isActive = activeSection === sec.section_type
        return (
          <button
            key={sec.section_type}
            ref={isActive ? activeLinkRef : null}
            onClick={() => scrollToSection(sec.section_type)}
            className={cn(
              "text-left text-sm px-2 py-1.5 rounded-md transition-colors w-full",
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            )}
          >
            {SECTION_LABELS[sec.section_type] ?? sec.section_type}
          </button>
        )
      })}
    </nav>
  )
}
