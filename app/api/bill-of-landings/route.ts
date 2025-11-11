import { executeQuery } from '@/lib/snowflake'

export async function GET() {
  try {
    // Create table and insert sample data
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS (
        ID NUMBER(38,0) AUTOINCREMENT START 1 INCREMENT 1 NOORDER,
        ORGANIZATION VARCHAR(500),
        INVOICENO VARIANT,
        GROSSWEIGHT DECIMAL(15,3),
        MEASUREMENT DECIMAL(15,3),
        TOTALCARTON NUMBER(10,0),
        SOURCE VARCHAR(500),
        SOURCEID VARCHAR(100),
        ONBOARDDATE DATE,
        VESSEL VARCHAR(500),
        PACKAGE_CODE VARIANT,
        PACKAGE_DESCRIPTION VARIANT,
        CREATEDAT TIMESTAMP_NTZ(9) DEFAULT CURRENT_TIMESTAMP(),
        UPDATEDAT TIMESTAMP_NTZ(9) DEFAULT CURRENT_TIMESTAMP()
      )
    `
    
    await executeQuery(createTableQuery)
    
    // Insert sample data if table is empty
    const countQuery = `SELECT COUNT(*) as count FROM DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS`
    const countResult = await executeQuery(countQuery) as Record<string, unknown>[]
    
    if (countResult[0]?.COUNT === 0) {
      const insertQuery = `
        INSERT INTO DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS 
        (ORGANIZATION, INVOICENO, GROSSWEIGHT, MEASUREMENT, TOTALCARTON, SOURCE, VESSEL, PACKAGE_CODE)
        VALUES 
        ('PT Shipping Indonesia', 'INV-2024-001', 1250.5, 45.2, 25, 'bill_001.pdf', 'MV Ocean Star', PARSE_JSON('["PROD-001", "PROD-002", "PROD-003"]')),
        ('Global Logistics Ltd', 'INV-2024-002', 890.3, 32.8, 18, 'bill_002.pdf', 'MV Sea Pioneer', PARSE_JSON('["PROD-004", "PROD-005"]')),
        ('Maritime Express Co', 'INV-2024-003', 2100.7, 78.5, 42, 'bill_003.pdf', 'MV Cargo Master', PARSE_JSON('["PROD-006", "PROD-007", "PROD-008", "PROD-009"]'))
      `
      await executeQuery(insertQuery)
    }
    
    const selectQuery = `
      SELECT 
        ID, ORGANIZATION, INVOICENO, GROSSWEIGHT, MEASUREMENT,
        TOTALCARTON, SOURCE, SOURCEID, ONBOARDDATE, VESSEL,
        PACKAGE_CODE, PACKAGE_DESCRIPTION, CREATEDAT, UPDATEDAT
      FROM DOC_AI_DB.PUBLIC.BILL_OF_LANDINGS
      ORDER BY CREATEDAT DESC
    `
    
    const rows = await executeQuery(selectQuery) as Record<string, unknown>[]
    
    const transformedData = rows.map((row: Record<string, unknown>) => {
      let itemArray = []
      if (typeof row.PACKAGE_CODE === 'string') {
        try {
          itemArray = JSON.parse(row.PACKAGE_CODE)
        } catch {
          itemArray = [row.PACKAGE_CODE]
        }
      } else if (Array.isArray(row.PACKAGE_CODE)) {
        itemArray = row.PACKAGE_CODE
      } else if (row.PACKAGE_CODE) {
        itemArray = [String(row.PACKAGE_CODE)]
      } else {
        itemArray = ["PKG001"]
      }
      
      return {
        id: row.ID,
        source: row.SOURCE || `bill_${String(row.ID).padStart(3, '0')}.pdf`,
        invoice_no: typeof row.INVOICENO === 'object' ? JSON.stringify(row.INVOICENO) : (row.INVOICENO || `INV-${String(row.ID).padStart(3, '0')}`),
        vendor_name: typeof row.ORGANIZATION === 'object' ? JSON.stringify(row.ORGANIZATION) : (row.ORGANIZATION || "Unknown Organization"),
        purchase_order_no: `PO-2024-${String(row.ID).padStart(3, '0')}`,
        item_no: itemArray,
        quantity: [String(row.TOTALCARTON || 1)],
        price: [String(row.GROSSWEIGHT || 0)],
        currency: "USD",
        created_at: row.CREATEDAT ? new Date(String(row.CREATEDAT)).toISOString() : new Date().toISOString(),
        header: `Bill of Lading ${typeof row.ORGANIZATION === 'object' ? 'Unknown' : (row.ORGANIZATION || 'Unknown')}`,
        type: "Bill of Lading",
        vessel: typeof row.VESSEL === 'object' ? JSON.stringify(row.VESSEL) : row.VESSEL,
        onboard_date: row.ONBOARDDATE,
        measurement: row.MEASUREMENT,
        total_amount: String(row.GROSSWEIGHT || 0)
      }
    })
    
    return Response.json(transformedData)
  } catch (error) {
    console.error('Bill of Landings query error:', error)
    return Response.json([])
  }
}