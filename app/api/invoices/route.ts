import { executeQuery } from '@/lib/snowflake'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const query = `
    SELECT
        inv.ID AS INVOICE_ID,
        LISTAGG(it.ITEMCODE, ', ')       WITHIN GROUP (ORDER BY it.ITEMCODE) AS ITEM_CODES,
        LISTAGG(it.QUANTITY::STRING, ', ') WITHIN GROUP (ORDER BY it.ITEMCODE) AS QUANTITIES,
        LISTAGG(it.UNITPRICE::STRING, ', ') WITHIN GROUP (ORDER BY it.ITEMCODE) AS PRICES,
        inv.CURRENCY,
        inv.CREATEDAT AS "Created At"
    FROM (
        SELECT 
            ID,
            CURRENCY,
            CREATEDAT,
            f.value::NUMBER AS ITEM_ID
        FROM INVOICES,
             LATERAL FLATTEN(input => ITEMS) f
    ) inv
    LEFT JOIN INVOICE_ITEMS it 
           ON it.ID = inv.ITEM_ID
    GROUP BY inv.ID, inv.CURRENCY, inv.CREATEDAT;
    `
    const rows = await executeQuery(query)
    
    // Transform Snowflake data to match expected schema
    const transformedData = rows.map((row: any) => ({
      id: row.INVOICE_ID,
      source: `invoice_${String(row.INVOICE_ID).padStart(3, '0')}.pdf`,
      invoice_no: `INV-2024-${String(row.INVOICE_ID).padStart(3, '0')}`,
      vendor_name: "SoftwareOne Indonesia",
      purchase_order_no: `PO-2024-${String(row.INVOICE_ID).padStart(3, '0')}`,
      item_no: row.ITEM_CODES ? row.ITEM_CODES.split(', ') : [],
      quantity: row.QUANTITIES ? row.QUANTITIES.split(', ') : [],
      price: row.PRICES ? row.PRICES.split(', ') : [],
      currency: row.CURRENCY || "USD",
      created_at: row["Created At"] ? new Date(row["Created At"]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      header: `Invoice SoftwareOne Indonesia`,
      type: "Invoice"
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