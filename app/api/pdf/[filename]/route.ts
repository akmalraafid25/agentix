import { NextRequest } from 'next/server'
import { executeQuery } from '../../../../lib/snowflake'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    
    // Determine folder based on filename
    const folder = filename.toLowerCase().includes('inv') ? 'invoice' : 'packing_list'
    
    // Get PDF file from Snowflake stage
    const query = `
      SELECT GET_PRESIGNED_URL('@STAGE_DOCUMENT', '${folder}/${filename}', 3600) AS url
    `
    
    const result = await executeQuery(query) as Record<string, unknown>[]
    const presignedUrl = result[0]?.URL
    
    if (!presignedUrl) {
      return new Response('PDF not found', { status: 404 })
    }
    
    // Fetch the PDF from the presigned URL
    const pdfResponse = await fetch(String(presignedUrl))
    
    if (!pdfResponse.ok) {
      return new Response('PDF not found', { status: 404 })
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer()
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('Error fetching PDF', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const webhookUrl = formData.get('webhookUrl') as string
    
    if (!file || !webhookUrl) {
      return new Response('File and webhookUrl required', { status: 400 })
    }

    // Determine folder and document type based on filename
    const lowerFilename = filename.toLowerCase()
    let folder, documentType
    
    if (lowerFilename.includes('inv')) {
      folder = 'invoice'
      documentType = 'invoice'
    } else if (lowerFilename.includes('packing') || lowerFilename.includes('pack') || lowerFilename.includes('pl')) {
      folder = 'packing_list'
      documentType = 'packing_list'
    } else if (lowerFilename.includes('bol') || lowerFilename.includes('lading') || lowerFilename.includes('bl')) {
      folder = 'bill_of_lading'
      documentType = 'bill_of_lading'
    } else {
      folder = 'other'
      documentType = 'other'
    }
    
    // Save file temporarily
    const fileBuffer = await file.arrayBuffer()
    const tempPath = join(tmpdir(), filename)
    writeFileSync(tempPath, Buffer.from(fileBuffer))
    
    try {
      // Upload to Snowflake stage
      const uploadQuery = `PUT file://${tempPath.replace(/\\/g, '/')} @STAGE_DOCUMENT/${folder}/ AUTO_COMPRESS=FALSE`
      console.log('Upload query:', uploadQuery)
      const result = await executeQuery(uploadQuery)
      console.log('Upload result:', result)
    } catch (uploadError) {
      console.error('Snowflake upload error:', uploadError)
      throw uploadError
    } finally {
      // Clean up temp file
      unlinkSync(tempPath)
    }
    
    // Send metadata to webhook
    const metadata = {
      filename,
      folder,
      documentType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      contentType: file.type
    }
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    })
    
    return Response.json({ success: true, metadata })
  } catch {
    return new Response('Upload failed', { status: 500 })
  }
}