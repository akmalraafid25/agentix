import { executeQuery } from '@/lib/snowflake'
import fs from 'fs'
import path from 'path'

export async function GET() {
  console.log('Invoice API: Starting request')
  try {
    const query = `
    SELECT
        inv.ID AS INVOICE_ID,
        MAX(inv.VENDORNAME) as VENDOR_NAME,
        inv.INVOICENO AS INVOICE_NO,
        inv.PONUMBER AS PO_NUMBER,
        inv.SOURCE,
        LISTAGG(it.ITEMCODE, ', ') WITHIN GROUP (ORDER BY it.ITEMCODE) AS ITEM_CODES,
        LISTAGG(it.QUANTITY::STRING, ', ') WITHIN GROUP (ORDER BY it.ITEMCODE) AS QUANTITIES,
        LISTAGG(it.UNITPRICE::STRING, ', ') WITHIN GROUP (ORDER BY it.ITEMCODE) AS PRICES,
        SUM(TRY_TO_NUMBER(it.UNITPRICE)) AS TOTAL_AMOUNT,
        inv.CURRENCY,
        inv.CREATEDAT AS "Created At"
    FROM (
        SELECT 
            ID,
            VENDORNAME,
            INVOICENO,
            PONUMBER,
            SOURCE,
            CURRENCY,
            CREATEDAT,
            f.value::NUMBER AS ITEM_ID
        FROM INVOICES,
             LATERAL FLATTEN(input => ITEMS) f
    ) inv
    LEFT JOIN INVOICE_ITEMS it 
           ON it.ID = inv.ITEM_ID
    GROUP BY inv.ID, inv.INVOICENO, inv.PONUMBER, inv.SOURCE, inv.CURRENCY, inv.CREATEDAT;
    `
    console.log('Invoice API: Executing query:', query)
    const rows = await executeQuery(query)
    console.log('Invoice API: Query result rows:', rows.length)
    console.log('Invoice API: Sample row:', rows[0])
    
    // Transform Snowflake data to match expected schema
    const transformedData = rows.map((row: any) => ({
      id: row.INVOICE_ID,
      source: row.SOURCE ? `${row.SOURCE}` : `invoice_${String(row.INVOICE_ID).padStart(3, '0')}`,
      invoice_no: row.INVOICE_NO || `-`,
      vendor_name: `${row.VENDOR_NAME}`,
      purchase_order_no: row.PO_NUMBER,
      item_no: row.ITEM_CODES ? row.ITEM_CODES.split(', ') : [],
      quantity: row.QUANTITIES ? row.QUANTITIES.split(', ') : [],
      price: row.PRICES ? row.PRICES.split(', ') : [],
      currency: row.CURRENCY || "USD",
      created_at: row["Created At"] ? new Date(row["Created At"]).toISOString() : new Date().toISOString(),
      header: `Invoice SoftwareOne Indonesia`,
      type: "Invoice",
      total_amount: row.TOTAL_AMOUNT ? row.TOTAL_AMOUNT.toString() : "0"
    }))
    
    console.log('Invoice API: Transformed data count:', transformedData.length)
    console.log('Invoice API: Sample transformed data:', transformedData[0])
    return Response.json(transformedData)
  } catch (error) {
    console.error('Invoice API: Snowflake query error:', error)
    console.error('Invoice API: Error details:', error.message)
    // Fallback to local data
    const filePath = path.join(process.cwd(), 'app/dashboard/data.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    console.log('Invoice API: Using fallback data, count:', data.length)
    return Response.json(data)
  }
}