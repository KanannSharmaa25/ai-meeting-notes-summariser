import { NextRequest, NextResponse } from 'next/server'
// import OpenAI from 'openai'

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const file = formData.get('file') as File

    let content = text

    if (file) {
      // For now, assume text file
      content = await file.text()
    }

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    // Mock AI processing
    const summary = `Summary of the meeting: ${content.substring(0, 100)}...`
    const keywords = ['meeting', 'discussion', 'action']
    const actionItems = [
      { task: 'Follow up on proposal', deadline: 'Next week', responsible: 'John' }
    ]
    const keySentences = ['This is a key point.', 'Important decision made.']

    // TODO: Replace with actual OpenAI calls
    // const summaryResponse = await openai.chat.completions.create({
    //   model: 'gpt-3.5-turbo',
    //   messages: [{ role: 'user', content: `Summarize this meeting: ${content}` }],
    // })
    // const summary = summaryResponse.choices[0].message.content

    return NextResponse.json({
      summary,
      keywords,
      actionItems,
      keySentences
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}