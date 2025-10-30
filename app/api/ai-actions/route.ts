import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { documentSet, action } = await request.json()
    
    const emailTemplates = {
      buyer_notify: {
        subject: `Document Review Required - ${documentSet}`,
        body: `Please review the document set ${documentSet} for processing.`
      },
      vendor_response: {
        subject: `Vendor Response Required - ${documentSet}`,
        body: `We require additional information for document set ${documentSet}.`
      },
      po_amendment: {
        subject: `PO Amendment Request - ${documentSet}`,
        body: `Purchase order amendment is required for document set ${documentSet}.`
      }
    }
    
    const template = emailTemplates[action as keyof typeof emailTemplates]
    
    // Send email (placeholder - integrate with your email service)
    console.log(`Sending email: ${template.subject}`)
    console.log(`Body: ${template.body}`)
    
    return Response.json({ success: true, action, documentSet })
  } catch (error) {
    return Response.json({ error: 'AI Action failed' }, { status: 500 })
  }
}