import { NextRequest, NextResponse } from "next/server"
import { listSubmissions, createSubmission } from "@/services/submissions"
import type { CreateSubmissionPayload } from "@/services/submissions"

export async function GET(request: NextRequest) {
  const formId = new URL(request.url).searchParams.get("formId")
  if (!formId) {
    return NextResponse.json({ error: "formId required" }, { status: 400 })
  }

  try {
    const data = await listSubmissions(formId)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body: CreateSubmissionPayload = await request.json()
  const { formId, answers } = body

  if (!formId || !answers) {
    return NextResponse.json(
      { error: "formId and answers required" },
      { status: 400 }
    )
  }

  try {
    const data = await createSubmission(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
