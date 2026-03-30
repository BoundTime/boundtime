import { getSiteUrl, SITE_NAME } from "@/lib/seo/site-config";

/**
 * Global JSON-LD: Organization + WebSite (ohne erfundene Kontaktdaten).
 */
export function JsonLdRoot() {
  const base = getSiteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/favicon.png`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        inLanguage: "de-DE",
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
