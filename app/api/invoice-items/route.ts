import { executeQuery } from '@/lib/snowflake'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const documentSet = searchParams.get('documentSet')

    
    const query = `
      SELECT 
        ii.PONO,
        ii.ITEMCODE,
        ii.QUANTITY,
        ii.UNITPRICE,
        ii.LINEAMOUNT,
        ii.MATCH,
        ii.MATCH_ERP,
        i.INVOICENO
      FROM INVOICE_ITEMS ii
      JOIN INVOICES i ON ii.INVOICEID = i.ID
      ORDER BY ii.ITEMCODE
    `
    
    const rows = await executeQuery(query)
    
    const transformedData = rows.map((row: Record<string, unknown>) => ({
      poNumber: row.PONO,
      itemCode: row.ITEMCODE,
      quantity: row.QUANTITY,
      unitPrice: row.UNITPRICE,
      lineAmount: row.LINEAMOUNT,
      matchERP: row.MATCH_ERP,
      matchPL: row.MATCH,
      invoiceNo: row.INVOICENO
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Invoice items query error:', error)
    return Response.json([])
  }
}