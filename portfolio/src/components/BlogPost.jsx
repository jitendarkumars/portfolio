import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { posts } from '../data/blog'
import Seo, { SITE_URL } from './Seo'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Renders a structured content block (rich posts use `blocks`; older posts use `body`).
function renderBlock(b, i) {
  switch (b.type) {
    case 'h':
      return <h2 className="post__h" key={i}>{b.text}</h2>
    case 'code':
      return (
        <pre className="post__code" key={i}>
          <code>{b.code}</code>
        </pre>
      )
    case 'ul':
      return (
        <ul className="post__ul" key={i}>
          {b.items.map((li, j) => <li key={j}>{li}</li>)}
        </ul>
      )
    case 'quote':
      return <blockquote className="post__quote" key={i}>{b.text}</blockquote>
    default:
      return <p key={i}>{b.text}</p>
  }
}

export default function BlogPost() {
  const { id } = useParams()
  const post = posts.find((p) => p.id === id)

  const jsonLd = useMemo(() => {
    if (!post) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      keywords: post.tags.join(', '),
      author: { '@type': 'Person', name: 'Jitendar Kumar', url: SITE_URL },
      url: `${SITE_URL}/blog/${post.id}`,
      mainEntityOfPage: `${SITE_URL}/blog/${post.id}`,
    }
  }, [post])

  if (!post) {
    return (
      <section className="section">
        <Seo
          title="Post not found — Jitendar Kumar"
          description="That article could not be found."
          path={`/blog/${id}`}
        />
        <div className="post-page">
          <span className="eyebrow">404</span>
          <h1 className="post-page__title">Post not found</h1>
          <p className="post-page__lead">That article doesn’t exist (or moved).</p>
          <Link className="btn btn--ghost" to="/blog">← All posts</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <article className="post-page">
        <Seo
          title={`${post.title} — Jitendar Kumar`}
          description={post.excerpt}
          path={`/blog/${post.id}`}
          type="article"
          jsonLd={jsonLd}
        />
        <Link className="post-page__back" to="/blog">← All posts</Link>
        <div className="post-page__meta">
          {formatDate(post.date)} · {post.readingTime} · {post.tags.join(', ')}
        </div>
        <h1 className="post-page__title">{post.title}</h1>
        {post.excerpt && <p className="post-page__lead">{post.excerpt}</p>}

        <div className="post-page__body">
          {post.blocks
            ? post.blocks.map((b, i) => renderBlock(b, i))
            : post.body.map((para, i) => <p key={i}>{para}</p>)}
        </div>

        <div className="tags post-page__tags">
          {post.tags.map((t) => (
            <span className="tag" key={t}>#{t}</span>
          ))}
        </div>

        <div className="post-page__nav">
          <Link className="btn btn--ghost" to="/blog">← Back to all posts</Link>
        </div>
      </article>
    </section>
  )
}
