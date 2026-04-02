import { NextRequest, NextResponse } from "next/server"
import { createDocument } from "@/services/documents"
import type { CreateDocumentPayload } from "@/services/documents"

export async function POST(request: NextRequest) {
  const body: CreateDocumentPayload = await request.json()
  const { businessId, formId, name } = body

  if (!businessId || !formId || !name) {
    return NextResponse.json(
      { error: "businessId, formId and name required" },
      { status: 400 }
    )
  }

  try {
    const data = await createDocument({ businessId, formId, name })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
