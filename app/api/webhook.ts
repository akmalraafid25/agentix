import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Send to external webhook
    const webhookData = {
      filename: data.filename,
      type: data.type,
      uploadedAt: new Date().toISOString(),
      ...data
    }
    
    await fetch('https://workflow.internal.sone.support/api/v1/webhooks/Y6kuvy51g0IExJGX8j47f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Webhook failed' }, { status: 500 })
  }
}