"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  MessageMultiple02Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getMe } from "@/services/supabase"
import { listForms, createForm, type Form } from "@/services/supabase/form"

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
]

type FieldDef = { label: string; name: string; type: string; required: boolean }

function toName(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function SubmissionsPage() {
  const [forms, setForms] = React.useState<Form[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [businessId, setBusinessId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        if (!me?.business) {
          setError("No business found for this account.")
          return
        }
        setBusinessId(me.business.id)
        setForms(await listForms(me.business.id))
      } catch {
        setError("Failed to load forms.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleCreated(form: Form) {
    setForms((prev) => [form, ...prev])
    setOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Submissions</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Select a form to view its submissions
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={() => setOpen(true)}
          title="Create form"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} strokeWidth={2} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : forms.length === 0 ? (
          <EmptyState onNew={() => setOpen(true)} />
        ) : (
          <>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {forms.length} {forms.length === 1 ? "form" : "forms"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          </>
        )}
      </div>

      {businessId && (
        <CreateFormDialog
          open={open}
          onOpenChange={setOpen}
          businessId={businessId}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

/* ─── Create form dialog ─── */

function CreateFormDialog({
  open,
  onOpenChange,
  businessId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string
  onCreated: (form: Form) => void
}) {
  const [name, setName] = React.useState("")
  const [fields, setFields] = React.useState<FieldDef[]>([
    { label: "", name: "", type: "text", required: false },
  ])
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  function reset() {
    setName("")
    setFields([{ label: "", name: "", type: "text", required: false }])
    setErr(null)
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { label: "", name: "", type: "text", required: false },
    ])
  }

  function removeField(i: number) {
    setFields((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateField(i: number, patch: Partial<FieldDef>) {
    setFields((prev) =>
      prev.map((f, idx) => {
        if (idx !== i) return f
        const updated = { ...f, ...patch }
        // auto-derive name from label unless user edited it manually
        if (patch.label !== undefined && f.name === toName(f.label)) {
          updated.name = toName(patch.label)
        }
        return updated
      }),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!name.trim()) return setErr("Form name is required.")
    const validFields = fields.filter((f) => f.label.trim())
    if (validFields.length === 0) return setErr("Add at least one field.")
    setSaving(true)
    try {
      const form = await createForm(businessId, name.trim(), validFields)
      reset()
      onCreated(form)
    } catch {
      setErr("Failed to create form. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create form</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form name */}
          <div className="space-y-1.5">
            <Label htmlFor="form-name">Form name</Label>
            <Input
              id="form-name"
              placeholder="e.g. Contact us"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Dynamic fields */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Fields</p>

            {fields.map((field, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  {/* Label */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Label
                    </Label>
                    <Input
                      placeholder="e.g. Full name"
                      value={field.label}
                      onChange={(e) =>
                        updateField(i, { label: e.target.value })
                      }
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Type
                    </Label>
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateField(i, { type: v })}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Required toggle + remove */}
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-foreground"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(i, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={13}
                        strokeWidth={1.5}
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full border border-dashed border-border text-muted-foreground"
              onClick={addField}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2} />
              Add field
            </Button>
          </div>

          {err && <p className="text-xs text-destructive">{err}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Creating…" : "Create form"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Form card ─── */

function FormCard({ form }: { form: Form }) {
  const submissionCount = form.submissions?.[0]?.count ?? 0
  const fieldCount = form.schema?.length ?? 0

  return (
    <Link href={`/business/submissions/${form.id}`} className="group block">
      <Card className="h-full transition-all group-hover:ring-foreground/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon
                icon={LegalDocument01Icon}
                size={16}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
          <CardTitle className="mt-1">{form.name}</CardTitle>
          <CardDescription>
            {fieldCount} {fieldCount === 1 ? "field" : "fields"}
          </CardDescription>
        </CardHeader>

        <CardFooter className="border-t pt-3">
          <div className="flex w-full items-center justify-between">
            <Badge variant="secondary">
              <HugeiconsIcon
                icon={MessageMultiple02Icon}
                size={10}
                strokeWidth={1.5}
              />
              {submissionCount}{" "}
              {submissionCount === 1 ? "submission" : "submissions"}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(form.created_at)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

/* ─── States ─── */

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Card className="mb-4 flex size-14 items-center justify-center rounded-xl border p-0 ring-0">
        <HugeiconsIcon
          icon={LegalDocument01Icon}
          size={22}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
      </Card>
      <p className="text-sm font-medium text-foreground">No forms yet</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Create your first form to start collecting submissions.
      </p>
      <Button size="sm" className="mt-4" onClick={onNew}>
        <HugeiconsIcon icon={PlusSignIcon} size={13} strokeWidth={2} />
        Create form
      </Button>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-xs text-destructive">{message}</p>
    </div>
  )
}
