import { NextRequest, NextResponse } from "next/server"
import { deleteDocument } from "@/services/documents"

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  try {
    await deleteDocument(id)
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
