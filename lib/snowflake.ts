import snowflake from 'snowflake-sdk'

let connection: snowflake.Connection | null = null

function getConnection() {
  if (!connection) {
    connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT!.toLowerCase(),
      username: process.env.SNOWFLAKE_USER!,
      password: process.env.SNOWFLAKE_PASSWORD!,
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
    conn.connect((err, conn) => {
      if (err) {
        reject(err)
      } else {
        resolve(conn)
      }
    })
  })
}

export async function executeQuery(query: string) {
  return new Promise((resolve, reject) => {
    const conn = getConnection()
    if (!conn.isUp()) {
      conn.connect((err, conn) => {
        if (err) {
          reject(err)
          return
        }
        executeQueryInternal(conn, query, resolve, reject)
      })
    } else {
      executeQueryInternal(conn, query, resolve, reject)
    }
  })
}

function executeQueryInternal(conn: snowflake.Connection, query: string, resolve: (value: unknown) => void, reject: (reason?: unknown) => void) {
  conn.execute({
    sqlText: query,
    complete: (err: unknown, stmt: unknown, rows: unknown) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    }
  })
}

export { getConnection }