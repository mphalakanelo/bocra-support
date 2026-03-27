'use client'
import { useState } from 'react'
import { KB_SIDEBAR_DATA } from './kbData'

export function KnowledgeBasePanel() {
  const [view, setView] = useState<'home' | 'category' | 'article'>('home')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedArt, setSelectedArt] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const allArticles = KB_SIDEBAR_DATA.flatMap(c => c.articles.map(a => ({ ...a, catIcon: c.icon, catTitle: c.title })))

  function doSearch(q: string) {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); setView('home'); return }
    const results = allArticles.filter(a =>
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.body.toLowerCase().includes(q.toLowerCase())
    )
    setSearchResults(results)
    setView('home')
  }

  function openArticle(art: any) {
    setSelectedArt(art)
    setView('article')
  }

  function openCategory(id: string) {
    setSelectedCat(id)
    setView('category')
    setSearchQuery('')
  }

  function goBack() {
    if (view === 'article' && selectedCat) setView('category')
    else { setView('home'); setSelectedCat(null); setSearchQuery('') }
  }

  const currentCat = KB_SIDEBAR_DATA.find(c => c.id === selectedCat)

  return (
    <div className="flex flex-col flex-1 bg-[#f4f6fa] overflow-hidden">
      {/* Hero */}
      <div className="bg-[#0a3d8f] px-8 py-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>📚 Knowledge Base</h2>
        <p className="text-white/70 text-xs mb-4">Regulations, FAQs, complaint procedures, consumer rights, and licensed operator information.</p>
        <div className="flex max-w-xl bg-white rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <input
            type="text"
            value={searchQuery}
            onChange={e => doSearch(e.target.value)}
            placeholder="Search articles, topics, regulations…"
            className="flex-1 px-4 py-2.5 text-sm text-[#1a2540] outline-none"
          />
          <button onClick={() => doSearch(searchQuery)} className="bg-[#00b4d8] hover:bg-[#0096c7] text-white px-5 text-sm font-semibold transition-colors">
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5">
        {/* Back button */}
        {view !== 'home' && (
          <button onClick={goBack} className="mb-4 text-xs text-[#3d5080] border border-[#dde3f0] px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
            ← Back
          </button>
        )}

        {/* Search results */}
        {searchQuery && (
          <>
            <p className="text-xs font-semibold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {searchResults.length === 0 ? (
              <p className="text-sm text-[#8895b0]">No articles found. Try different keywords or ask the AI assistant.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map(a => <ArticleCard key={a.id} article={a} onClick={() => openArticle(a)} />)}
              </div>
            )}
          </>
        )}

        {/* Article view */}
        {!searchQuery && view === 'article' && selectedArt && (
          <div className="bg-white border border-[#dde3f0] rounded-xl p-6 max-w-3xl">
            <h3 className="text-lg font-bold text-[#0a3d8f] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{selectedArt.catIcon} {selectedArt.title}</h3>
            <p className="text-xs text-[#8895b0] mb-4 pb-3 border-b border-[#dde3f0]">{selectedArt.catTitle} · Source: {selectedArt.source}</p>
            <div className="text-sm text-[#3d5080] leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedArt.body }} />
          </div>
        )}

        {/* Category view */}
        {!searchQuery && view === 'category' && currentCat && (
          <>
            <p className="text-xs font-semibold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{currentCat.icon} {currentCat.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCat.articles.map(a => (
                <ArticleCard key={a.id} article={{ ...a, catIcon: currentCat.icon, catTitle: currentCat.title }} onClick={() => openArticle({ ...a, catIcon: currentCat.icon, catTitle: currentCat.title })} />
              ))}
            </div>
          </>
        )}

        {/* Home view */}
        {!searchQuery && view === 'home' && (
          <>
            <p className="text-xs font-semibold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Browse by Category</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-7">
              {KB_SIDEBAR_DATA.map(cat => (
                <button key={cat.id} onClick={() => openCategory(cat.id)}
                  className="bg-white border border-[#dde3f0] rounded-xl p-4 text-left hover:border-[#1a5ccc] hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <h4 className="text-sm font-semibold text-[#1a2540] mb-1">{cat.title}</h4>
                  <p className="text-xs text-[#8895b0] leading-relaxed line-clamp-2">{cat.articles.length} articles</p>
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-[#0a3d8f] uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>All Articles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allArticles.map(a => <ArticleCard key={a.id} article={a} onClick={() => openArticle(a)} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ArticleCard({ article, onClick }: { article: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white border border-[#dde3f0] rounded-xl p-4 text-left hover:border-[#1a5ccc] hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="text-xl mb-2">{article.catIcon}</div>
      <h4 className="text-sm font-semibold text-[#1a2540] mb-1 leading-snug">{article.title}</h4>
      <p className="text-xs text-[#8895b0]">{article.catTitle}</p>
      <p className="text-xs text-[#00b4d8] font-semibold mt-2 uppercase tracking-wider">Read →</p>
    </button>
  )
}
