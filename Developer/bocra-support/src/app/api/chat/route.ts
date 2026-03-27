//import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

//const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BOCRA_SYSTEM = `You are BOCRA's official AI support assistant for the Botswana Communications Regulatory Authority.

Your knowledge covers:
- Telecommunications Act Cap 72:03, Consumer Protection Act 2018, Data Protection Act 2018
- BOCRA complaint procedures (contact operator first 5-7 days, then BOCRA; standard resolution: 14 working days)
- All licensed operators: Mascom (hotline 196), Orange Botswana/Smega (194), BTC (100), BoFiNet, Botswana Post (3653700)
- Consumer rights: billing disputes, MNP (free, max BWP 5, completes in 2 working days), contract rights, refunds
- Coverage obligations (urban: 97%, peri-urban: 90%, rural: 80%), QoS standards
- Data protection, OTT regulation, appeals process
- BOCRA contact: 3685500 | complaints@bocra.org.bw | Mon–Fri 7:30–16:30

When a user wants to file a complaint, collect these fields step by step:
1. Full name
2. Phone number
3. Email (optional)
4. Operator (Mascom / Orange/Smega / BTC / BoFiNet / Botswana Post / Other)
5. Complaint category
6. Description of the issue
7. Date issue started
8. Whether they contacted the operator already and the outcome

Once you have ALL fields, output a JSON block like this (and ONLY when complete):
\`\`\`json
{"name":"...","contact":"...","email":"...","operator":"...","category":"...","description":"...","date_started":"...","prior_contact":"..."}
\`\`\`

Be professional, empathetic, and concise. Quote specific regulations when relevant (e.g. "Under Telecom Act Cap 72:03..."). For complex matters, suggest speaking to a live agent.`

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()

    // Stream response from Claude
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: BOCRA_SYSTEM,
      messages,
      stream: true,
    })

    // Return a proper streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
