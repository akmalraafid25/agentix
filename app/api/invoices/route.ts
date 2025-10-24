import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    const query = `
      SELECT * from Invoices`
    
    const rows = await executeQuery(query)
    return Response.json(rows)
  } catch (error) {
    console.error('Snowflake query error:', error)
    return Response.json(error)
  }
}