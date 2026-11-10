import { lazy, Suspense, useEffect, useState } from "react";
import { SmoothScroll, useScrollTo } from "./hooks/SmoothScroll.jsx";
import { useReveal } from "./hooks/useReveal.js";
import { useHeavyFx } from "./hooks/useHeavyFx.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Idea from "./components/Idea.jsx";
import Glance from "./components/Glance.jsx";
import Gallery from "./components/Gallery.jsx";
import LazySection from "./components/LazySection.jsx";
import {
  Care,
  FamiliesFaq,
  Footer,
  Investors,
  LocationProgress,
  Vision,
} from "./components/Sections.jsx";

// code-split: the two big form/plan sections load after the first paint, the modal on first open
const FloorPlans = lazy(() => import("./components/FloorPlans.jsx"));
const Visit = lazy(() => import("./components/Visit.jsx"));
const LeadModal = lazy(() => import("./components/LeadModal.jsx"));

function Page() {
  useReveal();
  useHeavyFx();
  const scrollTo = useScrollTo();
  const [mode, setMode] = useState("visit");
  const [prefill, setPrefill] = useState(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadMounted, setLeadMounted] = useState(false);

  const openLead = () => {
    setLeadMounted(true);
    setLeadOpen(true);
  };

  // pop the lead modal up 7 seconds after the page opens (unless another modal is already open)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!document.querySelector(".imodal")) openLead();
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
      <Nav onBook={openLead} />
      <main id="top">
        <Hero onBook={openLead} />
        <Glance />
        <LazySection id="plans">
          <FloorPlans onAskAbout={askAbout} />
        </LazySection>
        <LocationProgress />
        <Gallery />
        <Idea />
        <Care />
        <Vision />
        <Investors />
        <FamiliesFaq />
        <LazySection id="visit">
          <Visit mode={mode} setMode={setMode} prefill={prefill} />
        </LazySection>
      </main>
      <Footer />
      {leadMounted && (
        <Suspense fallback={null}>
          <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
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
