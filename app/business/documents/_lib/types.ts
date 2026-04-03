export type DocType = "pdf" | "doc" | "docx" | "txt"
export type TabValue = "all" | "pdf" | "word" | "txt"

export const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "word", label: "Word" },
  { value: "txt", label: "Text" },
]
