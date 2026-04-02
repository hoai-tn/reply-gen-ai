import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { formId, question }: { formId: string; question: string } =
      await request.json()

    if (!formId || !question) {
      return NextResponse.json(
        { error: "formId and question required" },
        { status: 400 }
      )
    }

    // TODO: Call retrieveContext from services/rag
    // const context = await retrieveContext(formId, question)

    // TODO: Generate AI response with context
    // const aiResponse = await generateResponse(question, context)

    return NextResponse.json({
      success: true,
      message: "Message processed",
      // response: aiResponse,
    })
  } catch (error) {
    console.error("POST /api/messages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
