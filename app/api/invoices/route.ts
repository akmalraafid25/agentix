import data from '../../dashboard/data.json'

export async function GET() {
  return Response.json(data)
}