import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, SITE_NAME } from "@/lib/seo/site-config";
import { LandingNav } from "@/components/landing/LandingNav";
import { AgeGate } from "@/components/landing/AgeGate";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProfilePreview } from "@/components/landing/ProfilePreview";
import { DiscretionSection } from "@/components/landing/DiscretionSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    absolute: `BoundTime – Cuckold Community | Verifiziert & Diskret`,
  },
  description:
    "Die Community für Cuckoldpaare, Hotwives und Bulls. Verifizierte Profile, einzigartiger Cuckymode, BoundDollars-System. Diskret. DSGVO-konform. Deutsche Server.",
  keywords: ["Cuckold Community", "Hotwife", "BDSM Dating", "Keuschhaltung", "Cuckymode"],
  alternates: { canonical: siteUrl },
  openGraph: {
    title: `BoundTime – Cuckold Community`,
    description:
      "Vernetzung, Austausch und Dating – diskret, verifiziert, respektvoll.",
    url: siteUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "de_DE",
    images: [
      {
        url: `${siteUrl}/landing-brand-hero.png`,
        width: 1200,
        height: 630,
        alt: "BoundTime – Cuckold Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `BoundTime – Cuckold Community`,
    description: "Vernetzung, Austausch und Dating – diskret, verifiziert, respektvoll.",
    images: [`${siteUrl}/landing-brand-hero.png`],
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div
      className="landing-page page-bg"
      style={{ color: "var(--text-primary)" }}
    >
      <LandingNav />
      <AgeGate />

      <main>
        <HeroSection />
        <TrustBar />
        <FeatureShowcase />
        <HowItWorks />
        <ProfilePreview />
        <DiscretionSection />
        <Testimonials />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
