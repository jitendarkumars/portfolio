import { Link } from 'react-router-dom'
import { posts } from '../data/blog'
import Reveal from './Reveal'
import Seo from './Seo'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BlogIndex() {
  return (
    <section className="section" id="blog-index">
      <Seo
        title="Blog — Jitendar Kumar (Jeet)"
        description="Articles on local AI, fintech, Android & mobile, and full-stack engineering — written from real projects by Jitendar Kumar."
        path="/blog"
      />
      <Reveal>
        <span className="eyebrow">Writing</span>
        <h1 className="section__title">The blog</h1>
        <p className="section__lead">
          Notes on what I build — local AI, fintech, mobile, performance, and the occasional lesson.
        </p>
      </Reveal>

      <div className="blog__grid">
        {posts.map((post, i) => (
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
    </section>
  )
}
