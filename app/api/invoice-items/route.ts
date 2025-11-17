import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `
      SELECT 
        ii.ID,
        ii.PONO,
        ii.ITEMCODE,
        ii.QUANTITY,
        ii.UNITPRICE,
        ii.LINEAMOUNT,
        ii.VALIDITEM,
        ii.MATCH_ERP,
        ii.MATCH,
        ii.SKIP,
        ii.INVOICEID,
        ii.CREATEDAT,
        i.INVOICENO,
        i.VENDORNAME
      FROM DOC_AI_DB.PUBLIC.INVOICE_ITEMS ii
      LEFT JOIN DOC_AI_DB.PUBLIC.INVOICES i ON ii.INVOICEID = CAST(i.ID AS VARCHAR)
      ORDER BY ii.CREATEDAT DESC, ii.ITEMCODE
    `
    
    const rows = await executeQuery(query)
    
    const transformedData = (rows as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
      id: row.ID,
      poNumber: row.PONO,
      itemCode: row.ITEMCODE,
      quantity: row.QUANTITY,
      unitPrice: row.UNITPRICE,
      lineAmount: row.LINEAMOUNT,
      validItem: row.VALIDITEM,
      matchERP: row.MATCH_ERP,
      matchPL: row.MATCH,
      skip: row.SKIP,
      invoiceId: row.INVOICEID,
      invoiceNo: row.INVOICENO,
      vendorName: row.VENDORNAME,
      createdAt: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString()
    }))
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Invoice items query error:', error)
    const response = Response.json([])
    response.headers.set('X-Debug-Error', error instanceof Error ? error.message : 'Unknown error')
    return response
  }
}