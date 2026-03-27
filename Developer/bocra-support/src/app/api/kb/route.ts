import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const categorySlug = searchParams.get('category')
  const slug = searchParams.get('slug')

  const supabase = await createServiceSupabaseClient()

  // Single article by slug
  if (slug) {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('*, kb_categories(slug, icon, title)')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Increment view count
    await supabase.from('kb_articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id)

    return NextResponse.json(data)
  }

  // Search
  if (q) {
    const { data } = await supabase
      .from('kb_articles')
      .select('id, slug, title, tags, source_ref, view_count, kb_categories(slug, icon, title)')
      .eq('published', true)
      .or(`title.ilike.%${q}%,body.ilike.%${q}%,tags.cs.{${q}}`)
      .order('view_count', { ascending: false })
      .limit(20)
    return NextResponse.json({ articles: data || [] })
  }

  // By category
  if (categorySlug) {
    const { data } = await supabase
      .from('kb_articles')
      .select('id, slug, title, tags, source_ref, view_count, kb_categories!inner(slug, icon, title)')
      .eq('published', true)
      .eq('kb_categories.slug', categorySlug)
      .order('view_count', { ascending: false })
    return NextResponse.json({ articles: data || [] })
  }

  // All categories + article counts
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('*, kb_articles(count)')
    .order('sort_order')

  const { data: popular } = await supabase
    .from('kb_articles')
    .select('id, slug, title, view_count, kb_categories(slug, icon, title)')
    .eq('published', true)
    .order('view_count', { ascending: false })
    .limit(6)

  return NextResponse.json({ categories: categories || [], popular: popular || [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createServiceSupabaseClient()

    const { data, error } = await supabase
      .from('kb_articles')
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    const supabase = await createServiceSupabaseClient()

    const { data, error } = await supabase
      .from('kb_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
