import { NextRequest, NextResponse } from "next/server"
import { listDocuments } from "@/services/documents"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get("businessId")
  const formId = searchParams.get("formId") ?? undefined

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 })
  }

  try {
    const data = await listDocuments({ businessId, formId })
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
