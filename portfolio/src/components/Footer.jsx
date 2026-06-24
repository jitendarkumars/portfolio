import { Link } from 'react-router-dom'
import { profile } from '../data/profile'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__note">
          © {new Date().getFullYear()} {profile.name}. Built with <span>♥</span>, React & too much chai.
        </span>
        <Link
          to="/"
          className="footer__note"
          style={{ fontFamily: 'var(--font-mono)' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          back to top ↑
        </Link>
      </div>
    </footer>
  )
}
