export async function POST(request: Request) {
  try {
    const { subject, body, documentSet, invoiceFilename, packingList, action } = await request.json()
    
    const payload = {
      subject,
      body,
      documentSet,
      invoiceFilename,
      packingList,
      action
    }
    
    console.log('Sending webhook payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch('https://workflow.internal.sone.support/api/v1/webhooks/KEjQzXAn8DPX5UNMTI2l3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    console.log('Webhook response status:', response.status)
    console.log('Webhook response:', responseText)

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status} ${responseText}`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}