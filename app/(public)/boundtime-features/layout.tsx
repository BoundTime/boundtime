import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/seo/site-config";

const desc =
  "BoundTime- Features: Cuckymode für Paare, Keuschhaltungs-Vereinbarungen und BoundDollars (Fantasywährung) – optional und sachlich erklärt.";

export const metadata: Metadata = {
  title: "BoundTime- Features",
  description: desc,
  alternates: { canonical: "/boundtime-features" },
  openGraph: {
    title: `BoundTime- Features · ${SITE_NAME}`,
    description: desc,
    url: `${getSiteUrl()}/boundtime-features`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `BoundTime- Features · ${SITE_NAME}`,
    description: desc,
  },
};

export default function BoundTimeFeaturesLayout({ children }: { children: React.ReactNode }) {
  const base = getSiteUrl();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${base}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "BoundTime- Features",
        item: `${base}/boundtime-features`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}
