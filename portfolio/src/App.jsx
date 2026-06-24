import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './theme'
import Background3D from './components/Background3D'
import ScrollProgress from './components/ScrollProgress'
import IntroLoader from './components/IntroLoader'
import CursorRing from './components/CursorRing'
import Navbar from './components/Navbar'
import CommandPalette from './components/CommandPalette'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './components/Home'
import BlogIndex from './components/BlogIndex'
import BlogPost from './components/BlogPost'

function Shell() {
  const { theme } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <>
      <IntroLoader />
      <CursorRing />
      <Background3D theme={theme} />
      <div className="grain" aria-hidden="true" />
      <ScrollProgress />
      <ScrollToTop />

      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  )
}
