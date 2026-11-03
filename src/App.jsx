import { useState } from 'react'
import { SmoothScroll, useScrollTo } from './hooks/SmoothScroll.jsx'
import { useReveal } from './hooks/useReveal.js'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Statement from './components/Statement.jsx'
import Idea from './components/Idea.jsx'
import Glance from './components/Glance.jsx'
import Gallery from './components/Gallery.jsx'
import Levels from './components/Levels.jsx'
import FloorPlans from './components/FloorPlans.jsx'
import Visit from './components/Visit.jsx'
import { Care, Day, FamiliesFaq, Footer, LocationProgress, Vision } from './components/Sections.jsx'

function Page() {
  useReveal()
  const scrollTo = useScrollTo()
  const [mode, setMode] = useState('visit')
  const [prefill, setPrefill] = useState(null)

  const askAbout = (label) => {
    setMode('enquiry')
    setPrefill(`I'd like to know more about home ${label}.`)
    scrollTo('#visit')
  }

  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Statement />
        <Idea />
        <Glance />
        <Gallery />
        <Levels />
        <FloorPlans onAskAbout={askAbout} />
        <Care />
        <Day />
        <LocationProgress />
        <Vision />
        <FamiliesFaq />
        <Visit mode={mode} setMode={setMode} prefill={prefill} />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <SmoothScroll>
      <Page />
    </SmoothScroll>
  )
}
