import snowflake from 'snowflake-sdk'

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT!,
  username: process.env.SNOWFLAKE_USER!,
  authenticator: 'SNOWFLAKE_JWT',
  privateKey: process.env.SNOWFLAKE_PRIVATE_KEY!,
  database: process.env.SNOWFLAKE_DATABASE!,
  schema: process.env.SNOWFLAKE_SCHEMA!,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
})

export async function connectToSnowflake() {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
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
    if (!connection.isUp()) {
      connection.connect((err, conn) => {
        if (err) {
          reject(err)
          return
        }
        executeQueryInternal(conn, query, resolve, reject)
      })
    } else {
      executeQueryInternal(connection, query, resolve, reject)
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

export { connection }