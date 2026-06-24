import { profile } from '../data/profile'
import Reveal from './Reveal'

export default function About({ theme }) {
  return (
    <section className="section" id="about">
      <Reveal>
        <span className="eyebrow">01 — About</span>
        <h2 className="section__title">
          A developer who owns <span className="gradient-text">the whole stack</span>
        </h2>
      </Reveal>

      <div className="about__grid">
        <Reveal className="about__bio" delay={80}>
          {profile.about.map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          <div className="skills">
            {profile.skills.map((group) => (
              <div className="skill-group" key={group.group}>
                <div className="skill-group__name">{group.group}</div>
                <div className="tags">
                  {group.items.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="about__card" delay={160}>
          <div className="about__avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} />
            ) : (
              <span>{profile.name.charAt(0)}</span>
            )}
          </div>
          <div className="about__facts">
            <div className="fact"><span className="k">Name</span><span className="v">{profile.name}</span></div>
            <div className="fact"><span className="k">Role</span><span className="v">{profile.roles?.[0] || 'Full-stack developer'}</span></div>
            {profile.location && (
              <div className="fact"><span className="k">Based in</span><span className="v">{profile.location}</span></div>
            )}
            <div className="fact"><span className="k">Status</span><span className="v"><span className="dot" /> {profile.availability}</span></div>
            <div className="fact"><span className="k">Email</span><span className="v"><a href={`mailto:${profile.email}`}>{profile.email}</a></span></div>
          </div>
          {profile.resume && (
            <a className="btn btn--primary about__resume" href={profile.resume} download>
              Download résumé ↓
            </a>
          )}
        </Reveal>
      </div>
    </section>
  )
}
