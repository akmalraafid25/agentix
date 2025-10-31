import { executeQuery } from '@/lib/snowflake'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const query = `
    SELECT
  p.ID AS PACKING_LIST_ID,
  p.PONUMBER,
  p.ORGANIZATIONS,
  p.SOURCE,
  p.TOTALCARTON,
  p.TOTALGROSSWEIGHT,
  p.TOTALMEASUREMENT,
  LISTAGG(i.ITEMCODE, '\n') AS ITEMCODES,
  LISTAGG(TO_VARCHAR(i.QUANTITY), '\n') AS QUANTITIES,
  p.CREATEDAT,
  p.UPDATEDAT
FROM PACKING_LISTS p
LEFT JOIN PACKING_LIST_ITEMS i
  ON p.ID = i.PACKING_LIST_ID
GROUP BY
  p.ID, p.PONUMBER, p.ORGANIZATIONS, p.SOURCE,
  p.TOTALCARTON, p.TOTALGROSSWEIGHT, p.TOTALMEASUREMENT,
  p.CREATEDAT, p.UPDATEDAT
ORDER BY p.CREATEDAT DESC;
    `
    const rows = await executeQuery(query)
    
    // Transform Snowflake data to match expected schema
    const transformedData = rows.map((row: Record<string, unknown>) => ({
      id: row.PACKING_LIST_ID,
      source: row.SOURCE || `packing_${String(row.PACKING_LIST_ID).padStart(3, '0')}.pdf`,
      invoice_no: "",
      vendor_name: row.ORGANIZATIONS || "Unknown Organization",
      purchase_order_no: row.PONUMBER || `PO-2024-${String(row.PACKING_LIST_ID).padStart(3, '0')}`,
      item_no: row.ITEMCODES ? row.ITEMCODES.split('\n') : [],
      quantity: row.QUANTITIES ? row.QUANTITIES.split('\n') : [],
      price: [`${row.TOTALMEASUREMENT || 0}`],
      currency: "USD",
      created_at: row.CREATEDAT ? new Date(row.CREATEDAT).toISOString() : new Date().toISOString(),
      header: `Packing List ${row.ORGANIZATIONS || 'Unknown'}`,
      type: "Packing List"
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Snowflake query error:', error)
    // Fallback to local data
    const filePath = path.join(process.cwd(), 'app/dashboard/data.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return Response.json(data)
  }
}