import Nav from "../components/Nav";
import Hero from "../components/Hero";
import StickyCTA, { ScrollProgress } from "../components/StickyCTA";
import { ProblemSolution, Trust, TrustMarquee } from "../sections/ProblemTrust";
import { Listings, SmartSearch, ZeroBrokerage } from "../sections/AdvantageSearch";
import { BeforeAfter, SocialProof, UseCases } from "../sections/ProofCases";
import { HowItWorks } from "../sections/HowItWorks";
import { FAQ, FinalCTA, Fomo, Footer, Pricing } from "../sections/PricingClose";
import { Divider } from "../components/ui";
import SectionObserver from "../components/app/SectionObserver";

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#04050a] text-slate-200 antialiased">
      {/* global ambient field */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(60rem 40rem at 12% 8%, rgba(88,28,235,0.10), transparent 60%), radial-gradient(50rem 36rem at 88% 42%, rgba(8,145,178,0.09), transparent 60%), radial-gradient(48rem 34rem at 40% 96%, rgba(79,70,229,0.10), transparent 62%)",
        }}
        aria-hidden
      />
      {/* subtle film grain */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <ScrollProgress />
      <Nav />

      <main className="relative z-10">
        <Hero />
        <TrustMarquee />
        <ProblemSolution />
        <Divider />
        <SectionObserver><Trust /></SectionObserver>
        <SectionObserver><HowItWorks /></SectionObserver>
        <Divider />
        <SectionObserver><ZeroBrokerage /></SectionObserver>
        <SectionObserver><SmartSearch /></SectionObserver>
        <SectionObserver><Listings /></SectionObserver>
        <Divider />
        <SectionObserver><UseCases /></SectionObserver>
        <SectionObserver><BeforeAfter /></SectionObserver>
        <SectionObserver><SocialProof /></SectionObserver>
        <Divider />
        <SectionObserver><Pricing /></SectionObserver>
        <SectionObserver><Fomo /></SectionObserver>
        <SectionObserver><FAQ /></SectionObserver>
        <SectionObserver><FinalCTA /></SectionObserver>
      </main>

      <Footer />
      <StickyCTA />
    </div>
  );
}
