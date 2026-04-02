import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { formId, question } = await request.json()

  if (!formId || !question) {
    return NextResponse.json(
      { error: "formId and question required" },
      { status: 400 }
    )
  }

  // TODO: const context = await retrieveContext(formId, question)
  // TODO: const aiResponse = await generateResponse(question, context)

  return NextResponse.json({ success: true, message: "Message processed" })
}
