import { HugeiconsIcon } from "@hugeicons/react"
import { FolderLibraryIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DocumentsEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <Card className="mb-4 flex size-14 items-center justify-center rounded-xl border p-0 ring-0">
        <HugeiconsIcon
          icon={FolderLibraryIcon}
          size={22}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
      </Card>
      <p className="text-sm font-medium text-foreground">No documents yet</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Upload PDFs, Word documents, or text files to give your AI context when
        replying to submissions.
      </p>
      <Button size="sm" className="mt-4" onClick={onUpload}>
        <HugeiconsIcon icon={PlusSignIcon} size={13} strokeWidth={2} />
        Upload document
      </Button>
    </div>
  )
}
