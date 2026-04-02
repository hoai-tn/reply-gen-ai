import { NextRequest, NextResponse } from "next/server"
import { updateDocument } from "@/services/documents"
import type { UpdateDocumentPayload } from "@/services/documents"

export async function PUT(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body: UpdateDocumentPayload = await request.json()
  if (!body.name) {
    return NextResponse.json({ error: "name required" }, { status: 400 })
  }

  try {
    const data = await updateDocument(id, body)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
