import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/seo/site-config";

const desc =
  "Was ist BoundTime: Cuckold-Community, Ziele und Zielgruppen; dazu Überblick zu Ablauf, Cuckymode und Verifizierung – sachlich für neue Nutzer:innen.";

export const metadata: Metadata = {
  title: "Was ist BoundTime?",
  description: desc,
  alternates: { canonical: "/boundtime-features" },
  openGraph: {
    title: `Was ist BoundTime? · ${SITE_NAME}`,
    description: desc,
    url: `${getSiteUrl()}/boundtime-features`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Was ist BoundTime? · ${SITE_NAME}`,
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
        name: "Boundtime- Features",
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
