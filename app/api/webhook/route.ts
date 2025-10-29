import { NextRequest } from 'next/server'
import { executeQuery } from '../../../lib/snowflake'

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json()
    
    // Send metadata to external webhook
    await fetch('https://workflow.internal.sone.support/api/v1/webhooks/Y6kuvy51g0IExJGX8j47f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata)
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Webhook failed' }, { status: 500 })
  }
}