"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Document } from "@/services/supabase/document"
import type { Form } from "@/services/supabase/form"
import { TABS, type TabValue } from "../_lib/types"
import { matchTab } from "../_lib/utils"
import { DocumentList } from "./document-list"

export function DocumentTabs({
  tab,
  onTabChange,
  documents,
  forms,
  onDelete,
}: {
  tab: TabValue
  onTabChange: (tab: TabValue) => void
  documents: Document[]
  forms: Form[]
  onDelete: (doc: Document) => void
}) {
  const counts: Record<TabValue, number> = {
    all: documents.length,
    pdf: documents.filter((d) => matchTab(d, "pdf")).length,
    word: documents.filter((d) => matchTab(d, "word")).length,
    txt: documents.filter((d) => matchTab(d, "txt")).length,
  }

  const filtered = documents.filter((d) => matchTab(d, tab))

  return (
    <Tabs value={tab} onValueChange={(v) => onTabChange(v as TabValue)}>
      <TabsList className="mb-4">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
            {counts[t.value] > 0 && (
              <span className="ml-1 text-[10px] text-muted-foreground tabular-nums">
                {counts[t.value]}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <DocumentList docs={filtered} forms={forms} onDelete={onDelete} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
