import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/seo/site-config";

const desc =
  "Funktionen und Ablauf von BoundTime: Einordnung, Cuckymode, Keuschhaltung, Verifizierung – sachlicher Überblick für neue Nutzer.";

export const metadata: Metadata = {
  title: "Funktionen & Überblick",
  description: desc,
  alternates: { canonical: "/boundtime-features" },
  openGraph: {
    title: `Funktionen & Überblick · ${SITE_NAME}`,
    description: desc,
    url: `${getSiteUrl()}/boundtime-features`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Funktionen & Überblick · ${SITE_NAME}`,
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
        name: "Funktionen & Ablauf",
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
