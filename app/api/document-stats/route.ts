import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `
    WITH invoice_stats AS (
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN CREATEDAT >= DATEADD(month, -1, CURRENT_DATE()) THEN 1 END) as monthly_invoices,
        COUNT(CASE WHEN CREATEDAT >= DATEADD(month, -2, CURRENT_DATE()) AND CREATEDAT < DATEADD(month, -1, CURRENT_DATE()) THEN 1 END) as prev_monthly_invoices
      FROM INVOICES
    ),
    packing_stats AS (
      SELECT 
        COUNT(*) as total_packing,
        COUNT(CASE WHEN CREATEDAT >= DATEADD(month, -1, CURRENT_DATE()) THEN 1 END) as monthly_packing,
        COUNT(CASE WHEN CREATEDAT >= DATEADD(month, -2, CURRENT_DATE()) AND CREATEDAT < DATEADD(month, -1, CURRENT_DATE()) THEN 1 END) as prev_monthly_packing
      FROM PACKING_LISTS
    ),
    vendor_stats AS (
      SELECT 
        COUNT(DISTINCT VENDORNAME) as unique_vendors,
        COUNT(DISTINCT CASE WHEN CREATEDAT >= DATEADD(month, -1, CURRENT_DATE()) THEN VENDORNAME END) as monthly_vendors,
        COUNT(DISTINCT CASE WHEN CREATEDAT >= DATEADD(month, -2, CURRENT_DATE()) AND CREATEDAT < DATEADD(month, -1, CURRENT_DATE()) THEN VENDORNAME END) as prev_monthly_vendors
      FROM INVOICES
      WHERE VENDORNAME IS NOT NULL
    )
    SELECT 
      i.total_invoices,
      i.monthly_invoices,
      i.prev_monthly_invoices,
      p.total_packing,
      p.monthly_packing,
      p.prev_monthly_packing,
      v.unique_vendors,
      v.monthly_vendors,
      v.prev_monthly_vendors,
      (i.total_invoices + p.total_packing) as total_documents
    FROM invoice_stats i, packing_stats p, vendor_stats v
    `
    
    const rows = await executeQuery(query) as Record<string, unknown>[]
    
    if (rows.length === 0) {
      throw new Error('No data returned from query')
    }
    
    const data = rows[0]
    
    // Calculate growth rates
    const invoiceGrowth = data.PREV_MONTHLY_INVOICES && Number(data.PREV_MONTHLY_INVOICES) > 0 
      ? ((Number(data.MONTHLY_INVOICES) - Number(data.PREV_MONTHLY_INVOICES)) / Number(data.PREV_MONTHLY_INVOICES) * 100).toFixed(1)
      : '0.0'
    
    const packingGrowth = data.PREV_MONTHLY_PACKING && Number(data.PREV_MONTHLY_PACKING) > 0
      ? ((Number(data.MONTHLY_PACKING) - Number(data.PREV_MONTHLY_PACKING)) / Number(data.PREV_MONTHLY_PACKING) * 100).toFixed(1)
      : '0.0'
    
    const vendorGrowth = data.PREV_MONTHLY_VENDORS && Number(data.PREV_MONTHLY_VENDORS) > 0
      ? ((Number(data.MONTHLY_VENDORS) - Number(data.PREV_MONTHLY_VENDORS)) / Number(data.PREV_MONTHLY_VENDORS) * 100).toFixed(1)
      : '0.0'
    
    const totalGrowth = ((Number(data.MONTHLY_INVOICES) + Number(data.MONTHLY_PACKING)) > 0 && 
                        (Number(data.PREV_MONTHLY_INVOICES) + Number(data.PREV_MONTHLY_PACKING)) > 0)
      ? (((Number(data.MONTHLY_INVOICES) + Number(data.MONTHLY_PACKING)) - 
          (Number(data.PREV_MONTHLY_INVOICES) + Number(data.PREV_MONTHLY_PACKING))) / 
         (Number(data.PREV_MONTHLY_INVOICES) + Number(data.PREV_MONTHLY_PACKING)) * 100).toFixed(1)
      : '0.0'
    
    return Response.json({
      totalInvoices: Number(data.TOTAL_INVOICES) || 0,
      totalPacking: Number(data.TOTAL_PACKING) || 0,
      totalDocuments: Number(data.TOTAL_DOCUMENTS) || 0,
      uniqueVendors: Number(data.UNIQUE_VENDORS) || 0,
      invoiceGrowth: `${Number(invoiceGrowth) >= 0 ? '+' : ''}${invoiceGrowth}%`,
      packingGrowth: `${Number(packingGrowth) >= 0 ? '+' : ''}${packingGrowth}%`,
      vendorGrowth: `${Number(vendorGrowth) >= 0 ? '+' : ''}${vendorGrowth}%`,
      totalGrowth: `${Number(totalGrowth) >= 0 ? '+' : ''}${totalGrowth}%`
    })
  } catch (error) {
    console.error('Document stats API error:', error)
    return Response.json({
      totalInvoices: 0,
      totalPacking: 0,
      totalDocuments: 0,
      uniqueVendors: 0,
      invoiceGrowth: '+0.0%',
      packingGrowth: '+0.0%',
      vendorGrowth: '+0.0%',
      totalGrowth: '+0.0%'
    })
  }
}