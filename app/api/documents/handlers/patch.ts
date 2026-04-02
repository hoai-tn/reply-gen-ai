import { NextRequest, NextResponse } from "next/server"
import { updateDocument } from "@/services/documents"
import type { UpdateDocumentPayload } from "@/services/documents"

export async function PATCH(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body: UpdateDocumentPayload = await request.json()

  try {
    const data = await updateDocument(id, body)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
