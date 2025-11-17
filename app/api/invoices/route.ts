import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `
      SELECT 
        i.ID,
        i.INVOICENO,
        i.PONUMBER,
        i.VENDORNAME,
        i.CURRENCY,
        i.SOURCE,
        i.SOURCEID,
        i.ORGANIZATION,
        i.CREATEDAT,
        i.ITEMS,
        i.PAGES,
        ARRAY_AGG(ii.ITEMCODE) as ITEM_CODES,
        ARRAY_AGG(ii.QUANTITY) as QUANTITIES,
        ARRAY_AGG(ii.UNITPRICE) as PRICES,
        SUM(ii.LINEAMOUNT) as TOTAL_AMOUNT
      FROM DOC_AI_DB.PUBLIC.INVOICES i
      LEFT JOIN DOC_AI_DB.PUBLIC.INVOICE_ITEMS ii ON CAST(i.ID AS VARCHAR) = ii.INVOICEID
      GROUP BY i.ID, i.INVOICENO, i.PONUMBER, i.VENDORNAME, i.CURRENCY, i.SOURCE, i.SOURCEID, i.ORGANIZATION, i.CREATEDAT, i.ITEMS, i.PAGES
      ORDER BY i.CREATEDAT DESC
    `
    const rows = await executeQuery(query) as Record<string, unknown>[]
    
    const transformedData = rows.map((row: Record<string, unknown>) => ({
      id: row.ID,
      source: row.SOURCE || `invoice_${String(row.ID).padStart(3, '0')}`,
      invoice_no: row.INVOICENO || `-`,
      vendor_name: row.VENDORNAME || 'Unknown',
      purchase_order_no: row.PONUMBER,
      item_no: row.ITEM_CODES || [],
      quantity: row.QUANTITIES || [],
      price: row.PRICES || [],
      currency: row.CURRENCY || "USD",
      created_at: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString(),
      header: `Invoice SoftwareOne Indonesia`,
      type: "Invoice",
      total_amount: String(row.TOTAL_AMOUNT || 0),
      organization: row.ORGANIZATION,
      source_id: row.SOURCEID,
      items: row.ITEMS,
      pages: row.PAGES
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Invoice query error:', error)
    const response = Response.json([])
    response.headers.set('X-Debug-Error', error instanceof Error ? error.message : 'Unknown error')
    return response
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const webhookBody = {
      ...body,
      action_type: 'invoice_action'
    }
    
    const response = await fetch('https://workflow.internal.sone.support/api/v1/webhooks/KEjQzXAn8DPX5UNMTI2l3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookBody)
    })
    
    return Response.json({ success: true, status: response.status })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}