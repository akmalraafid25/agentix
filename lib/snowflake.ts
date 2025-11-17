import snowflake from 'snowflake-sdk'

let connection: snowflake.Connection | null = null

function getConnection() {
  if (!connection) {
    console.log('🔌 Creating Snowflake connection with account:', process.env.SNOWFLAKE_ACCOUNT?.toLowerCase())
    console.log('🔧 Snowflake Config:', {
      account: process.env.SNOWFLAKE_ACCOUNT?.toLowerCase(),
      username: process.env.SNOWFLAKE_USER,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      hasPrivateKey: !!process.env.SNOWFLAKE_PRIVATE_KEY
    })
    
    // Clean the private key by removing quotes and extra whitespace
    const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY!
      .replace(/'/g, '')  // Remove single quotes
      .trim()             // Remove whitespace
    
    connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT!.toLowerCase(),
      username: process.env.SNOWFLAKE_USER!,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey: privateKey,
      database: process.env.SNOWFLAKE_DATABASE!,
      schema: process.env.SNOWFLAKE_SCHEMA!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
    })
  }
  return connection
}

export async function connectToSnowflake() {
  return new Promise((resolve, reject) => {
    const conn = getConnection()
    console.log('🔄 Attempting Snowflake connection...')
    conn.connect((err, conn) => {
      if (err) {
        console.error('❌ Snowflake connection failed:', err)
        reject(err)
      } else {
        console.log('✅ Snowflake connection successful')
        resolve(conn)
      }
    })
  })
}

export async function executeQuery(query: string) {
  return new Promise((resolve, reject) => {
    let conn = getConnection()
    console.log('🔍 Checking Snowflake connection status:', conn.isUp())
    if (!conn.isUp()) {
      console.log('🔄 Reconnecting to Snowflake...')
      connection = null // Reset connection
      conn = getConnection() // Create new connection
      conn.connect((err, conn) => {
        if (err) {
          console.error('❌ Snowflake reconnection failed:', err)
          reject(err)
          return
        }
        console.log('✅ Snowflake reconnected, executing query')
        executeQueryInternal(conn, query, resolve, reject)
      })
    } else {
      console.log('♾️ Using existing Snowflake connection')
      executeQueryInternal(conn, query, resolve, reject)
    }
  })
}

function executeQueryInternal(conn: snowflake.Connection, query: string, resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
  console.log('📊 Executing Snowflake query:', query.substring(0, 100) + '...')
  conn.execute({
    sqlText: query,
    complete: (err: unknown, stmt: unknown, rows: unknown) => {
      if (err) {
        console.error('❌ Snowflake query failed:', err)
        reject(err)
      } else {
        console.log('✅ Snowflake query successful, rows returned:', Array.isArray(rows) ? rows.length : 'unknown')
        resolve(rows)
      }
    }
  })
}

export { getConnection }