import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const rows = await executeQuery(`
      SELECT 
        pl.ID, pl.ORGANIZATIONS, pl.PONUMBER, pl.SOURCE, pl.CREATEDAT,
        pl.TOTALMEASUREMENT, pl.TOTALGROSSWEIGHT, pl.TOTALCARTON,
        ARRAY_AGG(pli.ITEMCODE) as ITEM_CODES,
        ARRAY_AGG(pli.QUANTITY) as QUANTITIES
      FROM DOC_AI_DB.PUBLIC.PACKING_LISTS pl
      LEFT JOIN DOC_AI_DB.PUBLIC.PACKING_LIST_ITEMS pli ON pl.ID = pli.PACKING_LIST_ID
      GROUP BY pl.ID, pl.ORGANIZATIONS, pl.PONUMBER, pl.SOURCE, pl.CREATEDAT,
               pl.TOTALMEASUREMENT, pl.TOTALGROSSWEIGHT, pl.TOTALCARTON
      ORDER BY pl.CREATEDAT DESC
    `) as Record<string, unknown>[]
    
    const transformedData = rows.map(row => ({
      id: row.ID,
      source: row.SOURCE || `packing_${String(row.ID).padStart(3, '0')}.pdf`,
      invoice_no: row.PONUMBER || `PL-${String(row.ID).padStart(3, '0')}`,
      vendor_name: row.ORGANIZATIONS || "Unknown Organization",
      purchase_order_no: row.PONUMBER || `PO-2024-${String(row.ID).padStart(3, '0')}`,
      item_no: Array.isArray(row.ITEM_CODES) ? row.ITEM_CODES.filter(Boolean) : [],
      quantity: [String(row.TOTALCARTON || 0)],
      price: [String(row.TOTALGROSSWEIGHT || 0)],
      currency: "USD",
      created_at: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString(),
      header: `Packing List ${row.ORGANIZATIONS || 'Unknown'}`,
      type: "Packing List",
      total_amount: String(row.TOTALGROSSWEIGHT || 0)
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Packing query error:', error)
    return Response.json([])
  }
}