import { profile } from '../data/profile'
import { GitHubIcon, LinkedInIcon, TwitterIcon, YouTubeIcon, MailIcon } from './Icons'

export default function Socials() {
  const { socials, email } = profile
  const links = [
    { key: 'github', url: socials.github, label: 'GitHub', Icon: GitHubIcon },
    { key: 'linkedin', url: socials.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
    { key: 'twitter', url: socials.twitter, label: 'Twitter / X', Icon: TwitterIcon },
    { key: 'youtube', url: socials.youtube, label: 'YouTube', Icon: YouTubeIcon },
    { key: 'email', url: email ? `mailto:${email}` : '', label: 'Email', Icon: MailIcon },
  ].filter((l) => l.url)

  return (
    <div className="socials">
      {links.map(({ key, url, label, Icon }) => (
        <a
          key={key}
          href={url}
          className="social"
          aria-label={label}
          target={key === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}
