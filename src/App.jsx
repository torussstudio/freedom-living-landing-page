import { useEffect, useState } from "react";
import { SmoothScroll, useScrollTo } from "./hooks/SmoothScroll.jsx";
import { useReveal } from "./hooks/useReveal.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
// import Statement from "./components/Statement.jsx";
import Idea from "./components/Idea.jsx";
import Glance from "./components/Glance.jsx";
import Gallery from "./components/Gallery.jsx";
// import Levels from "./components/Levels.jsx";
import FloorPlans from "./components/FloorPlans.jsx";
import Visit from "./components/Visit.jsx";
import LeadModal from "./components/LeadModal.jsx";
import {
  Care,
  Day,
  FamiliesFaq,
  Footer,
  Investors,
  LocationProgress,
  Vision,
} from "./components/Sections.jsx";

function Page() {
  useReveal();
  const scrollTo = useScrollTo();
  const [mode, setMode] = useState("visit");
  const [prefill, setPrefill] = useState(null);
  const [leadOpen, setLeadOpen] = useState(false);

  // pop the lead modal up 7 seconds after the page opens (unless another modal is already open)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!document.querySelector(".imodal")) setLeadOpen(true);
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  const askAbout = (label) => {
    setMode("visit");
    setPrefill(`I'd like to know more about ${label}.`);
    scrollTo("#visit");
  };

  return (
    <>
      <Nav onBook={() => setLeadOpen(true)} />
      <main id="top">
        <Hero onBook={() => setLeadOpen(true)} />
        <Glance />
        <FloorPlans onAskAbout={askAbout} />
        <LocationProgress />
        <Gallery />
        <Idea />
        <Care />
        <Vision />
        <Investors />
        <FamiliesFaq />
        <Visit mode={mode} setMode={setMode} prefill={prefill} />
      </main>
      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <SmoothScroll>
      <Page />
    </SmoothScroll>
  );
}
