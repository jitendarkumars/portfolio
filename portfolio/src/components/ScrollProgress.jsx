import { motion, useScroll, useSpring } from 'framer-motion'

// A thin progress bar at the very top that fills as you scroll the page.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
