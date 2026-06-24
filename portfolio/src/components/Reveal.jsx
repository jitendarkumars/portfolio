import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * Framer Motion reveal: springs content in when it enters the viewport and
 * back out when it leaves (rise + scale + un-blur). `delay` staggers lists.
 */
export default function Reveal({ children, delay = 0, as = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-12% 0px -12% 0px' })
  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 46, scale: 0.965, filter: 'blur(7px)' }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, y: 46, scale: 0.965, filter: 'blur(7px)' }
      }
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
