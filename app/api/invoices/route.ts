import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `SELECT * FROM INVOICES`
    const rows = await executeQuery(query) as Record<string, unknown>[]
    
    const transformedData = rows.map((row: Record<string, unknown>) => ({
      id: row.ID,
      source: row.SOURCE || `invoice_${String(row.ID).padStart(3, '0')}`,
      invoice_no: row.INVOICENO || `-`,
      vendor_name: row.VENDORNAME || 'Unknown',
      purchase_order_no: row.PONUMBER,
      item_no: [],
      quantity: [],
      price: [],
      currency: row.CURRENCY || "USD",
      created_at: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString(),
      header: `Invoice SoftwareOne Indonesia`,
      type: "Invoice",
      total_amount: "0"
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    const response = Response.json([])
    response.headers.set('X-Debug-Error', error instanceof Error ? error.message : 'Unknown error')
    return response
  }
}