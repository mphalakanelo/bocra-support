import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ComplaintSchema = z.object({
  complainant_name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  national_id: z.string().optional(),
  district: z.string().min(1),
  address: z.string().optional(),
  operator: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(20),
  date_started: z.string(),
  account_number: z.string().optional(),
  prior_contact: z.string().optional(),
  resolution_sought: z.string().optional(),
  user_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = ComplaintSchema.parse(body)

    const supabase = await createServiceSupabaseClient()

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        ...data,
        email: data.email || null,
        status: 'submitted',
        priority: 'normal',
      })
      .select('id, reference_number, created_at')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reference_number: complaint.reference_number,
      complaint_id: complaint.id,
      created_at: complaint.created_at,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: err.issues }, { status: 400 })
    }
    console.error('Complaint API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'Reference number required' }, { status: 400 })
  }

  const supabase = await createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('complaints')
    .select('reference_number, status, category, operator, created_at, updated_at, resolved_at')
    .eq('reference_number', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
