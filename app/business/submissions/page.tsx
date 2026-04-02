"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  MessageMultiple02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMe } from "@/services/supabase"
import { listForms, type Form } from "@/services/supabase/form"

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

  React.useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        if (!me?.business) {
          setError("No business found for this account.")
          return
        }
        setForms(await listForms(me.business.id))
      } catch {
        setError("Failed to load forms.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-sm font-semibold text-foreground">Submissions</h1>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Select a form to view its submissions
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : forms.length === 0 ? (
          <EmptyState />
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
    </div>
  )
}

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
              <HugeiconsIcon icon={MessageMultiple02Icon} size={10} strokeWidth={1.5} />
              {submissionCount} {submissionCount === 1 ? "submission" : "submissions"}
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

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )
}

function EmptyState() {
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
