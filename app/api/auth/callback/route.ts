export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  console.log('Code:', code)
  console.log('Account:', process.env.SNOWFLAKE_ACCOUNT)
  console.log('Client ID:', process.env.SNOWFLAKE_CLIENT_ID)
  
  if (!code) {
    return Response.json({ error: 'No authorization code received' })
  }
  
  const response = await fetch(`https://${process.env.SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.SNOWFLAKE_CLIENT_ID!,
      client_secret: process.env.SNOWFLAKE_CLIENT_SECRET!,
      redirect_uri: process.env.SNOWFLAKE_REDIRECT_URI!
    })
  })
  
  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log('Error response:', errorText)
    return Response.json({ error: errorText }, { status: response.status })
  }
  
  const data = await response.json()
  return Response.json({ token: data.access_token })
}