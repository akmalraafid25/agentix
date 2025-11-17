import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const rows = await executeQuery(`
      SELECT ID, ORGANIZATION, INVOICENO, GROSSWEIGHT, TOTALCARTON, 
             SOURCE, ONBOARDDATE, VESSEL, PACKAGE_CODE, CREATEDAT
      FROM DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS
      ORDER BY CREATEDAT DESC
    `) as Record<string, unknown>[]
    
    const transformedData = rows.map(row => {
      const parsePackageCode = () => {
        if (typeof row.PACKAGE_CODE === 'string') {
          try { return JSON.parse(row.PACKAGE_CODE) } catch { return [row.PACKAGE_CODE] }
        }
        return Array.isArray(row.PACKAGE_CODE) ? row.PACKAGE_CODE : [row.PACKAGE_CODE || "PKG001"]
      }
      
      return {
        id: row.ID,
        source: row.SOURCE || `bill_${String(row.ID).padStart(3, '0')}.pdf`,
        invoice_no: row.INVOICENO || `INV-${String(row.ID).padStart(3, '0')}`,
        vendor_name: row.ORGANIZATION || "Unknown Organization",
        purchase_order_no: row.VESSEL || "Unknown Vessel",
        item_no: parsePackageCode(),
        quantity: [String(row.TOTALCARTON || 1)],
        price: [String(row.GROSSWEIGHT || 0)],
        currency: "USD",
        created_at: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString(),
        header: `Bill of Lading ${row.ORGANIZATION || 'Unknown'}`,
        type: "Bill of Lading",
        vessel: row.VESSEL,
        onboard_date: row.ONBOARDDATE,
        total_amount: String(row.GROSSWEIGHT || 0)
      }
    })
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Bill of Landings query error:', error)
    const response = Response.json([])
    response.headers.set('X-Debug-Error', error instanceof Error ? error.message : 'Unknown error')
    return response
  }
}