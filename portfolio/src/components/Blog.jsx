import { Link } from 'react-router-dom'
import { posts } from '../data/blog'
import Reveal from './Reveal'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Blog() {
  const featured = posts.slice(0, 3)

  return (
    <section className="section" id="blog">
      <Reveal>
        <span className="eyebrow">03 — Writing</span>
        <h2 className="section__title">From the blog</h2>
        <p className="section__lead">
          I write about what I learn while building — local AI, performance, tooling, and the
          occasional career lesson.
        </p>
      </Reveal>

      <div className="blog__grid">
        {featured.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 80} className="card">
            <Link to={`/blog/${post.id}`} className="post">
              <div className="post__meta">
                <span>{formatDate(post.date)}</span>
                <span>· {post.readingTime}</span>
              </div>
              <h3 className="post__title">{post.title}</h3>
              <p className="post__excerpt">{post.excerpt}</p>
              <span className="post__readmore">
                Read article <span className="arrow">→</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      {posts.length > 3 && (
        <div className="blog__all">
          <Link to="/blog" className="btn btn--ghost">View all posts →</Link>
        </div>
      )}
    </section>
  )
}
