import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const complaintId = formData.get('complaint_id') as string
    const files = formData.getAll('files') as File[]

    if (!complaintId || !files.length) {
      return NextResponse.json({ error: 'complaint_id and files required' }, { status: 400 })
    }

    const supabase = await createServiceSupabaseClient()
    const uploadedFiles = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `${file.name} exceeds 5MB limit` }, { status: 400 })
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `${file.name} has unsupported type` }, { status: 400 })
      }

      const ext = file.name.split('.').pop()
      const storagePath = `${complaintId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const arrayBuffer = await file.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(storagePath, arrayBuffer, { contentType: file.type })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: attachment } = await supabase
        .from('complaint_attachments')
        .insert({
          complaint_id: complaintId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: storagePath,
        })
        .select()
        .single()

      if (attachment) uploadedFiles.push(attachment)
    }

    return NextResponse.json({ success: true, attachments: uploadedFiles })
  } catch (err) {
    console.error('Attachment upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
