import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../data/profile'

// Brand boot screen: logo + filling bar, then the curtain lifts away.
export default function IntroLoader() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setDone(true), reduced ? 0 : 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="intro-loader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="intro-loader__inner">
            <div className="intro-loader__logo">
              {profile.name}<span>.</span>
            </div>
            <div className="intro-loader__bar">
              <motion.div
                className="intro-loader__fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.35, ease: 'easeInOut' }}
              />
            </div>
            <div className="intro-loader__cap">booting portfolio…</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
