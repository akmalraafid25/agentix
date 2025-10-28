import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export function generateJWT() {
  const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY!.replace(/\\n/g, '\n')
  const account = process.env.SNOWFLAKE_ACCOUNT!
  const user = process.env.SNOWFLAKE_USER!
  
  const publicKeyFingerprint = crypto
    .createPublicKey(privateKey)
    .export({ format: 'der', type: 'spki' })
  const sha256Hash = crypto.createHash('sha256').update(publicKeyFingerprint).digest('base64')
  
  const payload = {
    iss: `${account}.${user}.SHA256:${sha256Hash}`,
    sub: `${account}.${user}`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  }
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}