import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `
    WITH daily_data AS (
      SELECT 
        DATE(CREATEDAT) as date,
        'invoice' as type,
        COUNT(*) as count
      FROM INVOICES 
      WHERE CREATEDAT >= DATEADD(day, -90, CURRENT_DATE())
      GROUP BY DATE(CREATEDAT)
      
      UNION ALL
      
      SELECT 
        DATE(CREATEDAT) as date,
        'packing' as type,
        COUNT(*) as count
      FROM PACKING_LISTS 
      WHERE CREATEDAT >= DATEADD(day, -90, CURRENT_DATE())
      GROUP BY DATE(CREATEDAT)
      
      UNION ALL
      
      SELECT 
        DATE(CREATEDAT) as date,
        'billOfLandings' as type,
        COUNT(*) as count
      FROM DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS 
      WHERE CREATEDAT >= DATEADD(day, -90, CURRENT_DATE())
      GROUP BY DATE(CREATEDAT)
    ),
    date_range AS (
      SELECT DATEADD(day, seq4(), DATEADD(day, -90, CURRENT_DATE())) as date
      FROM TABLE(GENERATOR(ROWCOUNT => 91))
    )
    SELECT 
      dr.date,
      COALESCE(SUM(CASE WHEN dd.type = 'invoice' THEN dd.count END), 0) as invoices,
      COALESCE(SUM(CASE WHEN dd.type = 'packing' THEN dd.count END), 0) as packing,
      COALESCE(SUM(CASE WHEN dd.type = 'billOfLandings' THEN dd.count END), 0) as billOfLandings
    FROM date_range dr
    LEFT JOIN daily_data dd ON dr.date = dd.date
    GROUP BY dr.date
    ORDER BY dr.date
    `
    
    const rows = await executeQuery(query) as Record<string, unknown>[]
    
    const chartData = rows.map((row: Record<string, unknown>) => ({
      date: new Date(String(row.DATE)).toISOString().split('T')[0],
      invoices: Number(row.INVOICES) || 0,
      packing: Number(row.PACKING) || 0,
      billOfLandings: Number(row.BILLOFLANDINGS) || 0
    }))
    
    return Response.json(chartData)
  } catch (error) {
    console.error('Chart data API error:', error)
    return Response.json([])
  }
}