import type { Artist, Painting } from "@/types";

interface PersonSchemaProps {
  artist: Artist;
  siteUrl: string;
}

export function PersonSchema({ artist, siteUrl }: PersonSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    jobTitle: artist.title || "国画艺术家",
    description: artist.bio.replace(/<[^>]*>/g, "").slice(0, 200),
    image: artist.avatarUrl,
    url: `${siteUrl}/artist`,
    sameAs: [],
    knowsAbout: ["中国画", "水墨画", "国画", "传统艺术"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArtGallerySchemaProps {
  siteUrl: string;
  artistName: string;
}

export function ArtGallerySchema({ siteUrl, artistName }: ArtGallerySchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    name: `${artistName}国画`,
    description: `${artistName}，当代国画艺术家。专注于传统水墨画创作，将东方美学与现代艺术融合。`,
    url: siteUrl,
    image: `${siteUrl}/og-image.jpg`,
    founder: {
      "@type": "Person",
      name: artistName,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface VisualArtworkSchemaProps {
  painting: Painting;
  artistName: string;
  siteUrl: string;
}

export function VisualArtworkSchema({ painting, artistName, siteUrl }: VisualArtworkSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: painting.title,
    description: painting.description,
    image: painting.imageUrl,
    dateCreated: String(painting.year),
    creator: {
      "@type": "Person",
      name: artistName,
    },
    artMedium: "水墨",
    artform: "国画",
    width: painting.dimensions?.split("×")[0]?.trim(),
    height: painting.dimensions?.split("×")[1]?.replace("cm", "").trim(),
    url: `${siteUrl}/gallery?highlight=${painting.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
