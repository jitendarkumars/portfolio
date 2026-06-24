import { Component } from 'react'

// If WebGL can't initialize (no GPU, context limit, driver block), don't crash
// the whole app — just render an optional fallback and keep the site usable.
export default class WebGLBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    if (typeof console !== 'undefined') console.warn('[webgl] disabled:', error && error.message)
  }
  render() {
    if (this.state.failed) return this.props.fallback || null
    return this.props.children
  }
}
