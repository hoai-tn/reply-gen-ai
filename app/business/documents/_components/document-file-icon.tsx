import { HugeiconsIcon } from "@hugeicons/react"
import { Pdf01Icon, Doc01Icon, File01Icon } from "@hugeicons/core-free-icons"
import type { DocType } from "../_lib/types"

export function DocumentFileIcon({
  type,
  size = 14,
}: {
  type: DocType
  size?: number
}) {
  if (type === "pdf")
    return (
      <HugeiconsIcon
        icon={Pdf01Icon}
        size={size}
        strokeWidth={1.5}
        className="text-red-500"
      />
    )
  if (type === "doc" || type === "docx")
    return (
      <HugeiconsIcon
        icon={Doc01Icon}
        size={size}
        strokeWidth={1.5}
        className="text-blue-500"
      />
    )
  return (
    <HugeiconsIcon
      icon={File01Icon}
      size={size}
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  )
}
