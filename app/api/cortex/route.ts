import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { executeQuery } from '../../../lib/snowflake'

function generateJWT() {
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
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    const token = generateJWT()
    
    const response = await fetch(`https://${process.env.SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/cortex/analyst/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AgentiX/1.0',
        'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [{
              type: 'text',
              text: message
            }]
          }
        ],
        semantic_view: 'AGENTIX.PUBLIC.AGENTIX_CORTEX'
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cortex API Error:', response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Cortex Response:', data)
    console.log('Content array:', JSON.stringify(data.message?.content, null, 2))
    data.message?.content?.forEach((item: { type: string; text?: string; statement?: string; results?: unknown }, index: number) => {
      console.log(`Content item ${index}:`, item)
      console.log(`Type: ${item.type}`)
      if (item.text) console.log(`Text: ${item.text}`)
      if (item.statement) console.log(`SQL: ${item.statement}`)
      if (item.results) console.log(`Results:`, item.results)
    })
    
    let assistantResponse = data.message?.content || [{ type: 'text', text: "I couldn't process your request." }]
    
    // Execute SQL queries and add results
    if (Array.isArray(assistantResponse)) {
      const enhancedResponse = []
      
      for (const item of assistantResponse) {
        enhancedResponse.push(item)
        
        if (item.type === 'sql' && item.statement) {
          try {
            const results = await executeQuery(item.statement)
            enhancedResponse.push({
              type: 'results',
              results: results
            })
          } catch (error) {
            enhancedResponse.push({
              type: 'text',
              text: `Error executing query: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
      }
      
      assistantResponse = enhancedResponse
    }
    
    return Response.json({ response: assistantResponse })
  } catch (error) {
    console.error('Cortex error:', error)
    return Response.json({ response: `Error connecting to Cortex Analyst: ${error instanceof Error ? error.message : 'Unknown error'}` })
  }
}