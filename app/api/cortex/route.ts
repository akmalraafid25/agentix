import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    const response = await fetch(`https://${process.env.SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/cortex/analyst`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SNOWFLAKE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: message,
        context: "invoice_data"
      })
    })
    
    const data = await response.json()
    return Response.json({ response: data.answer })
  } catch (error) {
    return Response.json({ response: "I'm analyzing your request. Please ensure Snowflake Cortex Analyst is properly configured." })
  }
}