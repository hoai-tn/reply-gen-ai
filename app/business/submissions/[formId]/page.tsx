"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  Mail01Icon,
  ChevronDown,
  SparklesIcon,
  MessageMultiple02Icon,
  Analytics02Icon,
  InboxCheckIcon,
  Timer01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getForm, type Form } from "@/services/supabase/form"
import { listSubmissions } from "@/services/supabase"

type Submission = {
  id: string
  form_id: string
  email: string | null
  answers: Record<string, unknown>
  ai_response: string | null
  created_at: string
}

function formatRelative(iso: string) {
  const diffH = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60)
  if (diffH < 1) return "Just now"
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  if (diffH < 168) return `${Math.floor(diffH / 24)}d ago`
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function avatarColor(email: string) {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  ]
  return colors[email.charCodeAt(0) % colors.length]
}

export default function FormSubmissionsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [form, setForm] = React.useState<Form | null>(null)
  const [submissions, setSubmissions] = React.useState<Submission[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [formData, subsData] = await Promise.all([
          getForm(formId),
          listSubmissions(formId),
        ])
        setForm(formData)
        setSubmissions(subsData as Submission[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formId])

  const total = submissions.length
  const replied = submissions.filter((s) => s.ai_response).length
  const pending = total - replied
  const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0
  const uniqueSenders = new Set(submissions.map((s) => s.email)).size

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-border px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-3 -ml-2 text-muted-foreground"
        >
          <Link href="/business/submissions">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
            Submissions
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-0.5">
            {loading ? (
              <>
                <Skeleton className="h-4 w-44" />
                <Skeleton className="mt-1.5 h-3 w-32" />
              </>
            ) : (
              <>
                <h1 className="text-sm font-semibold text-foreground">
                  {form?.name ?? "Form"}
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  {form?.schema?.length ?? 0} fields
                  {form && ` · Created ${formatFull(form.created_at)}`}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{loading ? "—" : total} Total</Badge>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={10}
                strokeWidth={2}
              />
              {loading ? "—" : replied} Replied
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <HugeiconsIcon icon={Clock01Icon} size={10} strokeWidth={2} />
              {loading ? "—" : pending} Pending
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="space-y-6 p-6">
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={MessageMultiple02Icon}
                label="Total submissions"
                value={total}
                iconClass="text-blue-500"
                iconBg="bg-blue-50 dark:bg-blue-950/40"
              />
              <StatCard
                icon={InboxCheckIcon}
                label="AI replied"
                value={replied}
                iconClass="text-emerald-500"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                valueClass="text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                icon={Timer01Icon}
                label="Awaiting reply"
                value={pending}
                iconClass="text-amber-500"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
                valueClass={
                  pending > 0 ? "text-amber-600 dark:text-amber-400" : undefined
                }
              />
              <StatCard
                icon={UserCircleIcon}
                label="Unique senders"
                value={uniqueSenders}
                iconClass="text-violet-500"
                iconBg="bg-violet-50 dark:bg-violet-950/40"
              />
            </div>

            {/* ── Reply rate ── */}
            {total > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                        <HugeiconsIcon
                          icon={Analytics02Icon}
                          size={14}
                          strokeWidth={1.5}
                          className="text-muted-foreground"
                        />
                      </div>
                      <CardTitle>Reply rate</CardTitle>
                    </div>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {replyRate}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${replyRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{replied} replied</span>
                    <span>{pending} pending</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* ── Messages ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Messages{total > 0 && ` · ${total}`}
                </p>
              </div>

              {submissions.length === 0 ? (
                <MessagesEmptyState />
              ) : (
                <div className="space-y-2">
                  {submissions.map((s) => (
                    <SubmissionCard key={s.id} submission={s} form={form} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Stat card ─── */

function StatCard({
  icon,
  label,
  value,
  iconClass,
  iconBg,
  valueClass,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: number
  iconClass: string
  iconBg: string
  valueClass?: string
}) {
  return (
    <Card>
      <CardHeader>
        <div
          className={`mb-1 flex size-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          <HugeiconsIcon
            icon={icon}
            size={42}
            strokeWidth={1.5}
            className={iconClass}
          />
        </div>
        <CardTitle className={`text-2xl tabular-nums ${valueClass ?? ""}`}>
          {value}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
    </Card>
  )
}

/* ─── Submission card (rich preview) ─── */

function SubmissionCard({
  submission,
  form,
}: {
  submission: Submission
  form: Form | null
}) {
  const [expanded, setExpanded] = React.useState(false)
  const answered = !!submission.ai_response
  const entries = Object.entries(submission.answers)
  const email = submission.email ?? "Anonymous"
  const colorClass = submission.email
    ? avatarColor(submission.email)
    : "bg-muted text-muted-foreground"

  return (
    <Card className="overflow-hidden transition-all">
      {/* ── Preview row ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
      >
        {/* Avatar */}
        <div
          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${colorClass}`}
        >
          {email[0].toUpperCase()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Top line */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              {email}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {answered ? (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                >
                  <HugeiconsIcon
                    icon={CheckmarkBadge01Icon}
                    size={10}
                    strokeWidth={2}
                  />
                  Replied
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                >
                  <HugeiconsIcon icon={Clock01Icon} size={10} strokeWidth={2} />
                  Pending
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground">
                {formatRelative(submission.created_at)}
              </span>
              <HugeiconsIcon
                icon={ChevronDown}
                size={13}
                strokeWidth={1.5}
                className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {/* Answer previews */}
          {entries.map(([key, val]) => {
            const label =
              form?.schema?.find((f) => f.name === key)?.label ?? key
            return (
              <div key={key} className="flex items-baseline gap-1.5">
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {label}:
                </span>
                <span className="truncate text-[11px] text-foreground">
                  {String(val)}
                </span>
              </div>
            )
          })}

          {/* AI response preview */}
          {submission.ai_response && (
            <div className="flex items-baseline gap-1.5">
              <HugeiconsIcon
                icon={SparklesIcon}
                size={11}
                strokeWidth={1.5}
                className="mt-px shrink-0 text-emerald-500"
              />
              <span className="truncate text-[11px] text-emerald-600 dark:text-emerald-400">
                {submission.ai_response}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <>
          <Separator />
          <div className="space-y-4 bg-muted/20 px-4 py-4">
            {/* Full answers */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Answers
              </p>
              {entries.map(([key, val]) => {
                const label =
                  form?.schema?.find((f) => f.name === key)?.label ?? key
                return (
                  <Card key={key} size="sm">
                    <CardHeader>
                      <CardDescription>{label}</CardDescription>
                      <p className="text-xs text-foreground">{String(val)}</p>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            {/* AI response */}
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  size={11}
                  strokeWidth={1.5}
                />
                AI Response
              </p>
              {submission.ai_response ? (
                <Card
                  size="sm"
                  className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                >
                  <CardContent className="pt-3">
                    <p className="text-xs leading-relaxed text-foreground">
                      {submission.ai_response}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card size="sm">
                  <CardContent className="pt-3">
                    <p className="text-[11px] text-muted-foreground">
                      No AI response generated yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <HugeiconsIcon icon={Mail01Icon} size={12} strokeWidth={1.5} />
              Submitted{" "}
              {new Date(submission.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

/* ─── Skeleton & empty ─── */

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-lg" />
      <Separator />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function MessagesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-foreground">No submissions yet</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Share your form link and submissions will appear here.
      </p>
    </div>
  )
}
