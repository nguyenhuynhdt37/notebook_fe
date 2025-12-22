import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://edugenius.vinhuni.edu.vn";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
}

/**
 * Tạo metadata SEO cho từng page
 * @example
 * export const metadata = generateSEO({
 *   title: "Trang chủ",
 *   description: "Mô tả trang chủ",
 * });
 */
export function generateSEO({
  title,
  description,
  keywords = [],
  image = "/og-image.png",
  url = baseUrl,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "EduGenius - Đại học Vinh",
  noIndex = false,
}: SEOProps): Metadata {
  const fullTitle = title.includes("EduGenius")
    ? title
    : `${title} | EduGenius - Đại học Vinh`;

  return {
    title,
    description,
    keywords: [
      ...keywords,
      "EduGenius",
      "Đại học Vinh",
      "AI giáo dục",
      "học tập thông minh",
    ],
    authors: [{ name: author }],
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "EduGenius - Đại học Vinh",
      images: [
        {
          url: image.startsWith("http") ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "vi_VN",
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * JSON-LD cho Article/Blog
 */
export function generateArticleJsonLd({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: image || `${baseUrl}/og-image.png`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "EduGenius",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo/vinh-university-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * JSON-LD cho Breadcrumb
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * JSON-LD cho FAQ
 */
export function generateFAQJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
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
}

/**
 * JSON-LD cho Course/Lesson
 */
export function generateCourseJsonLd({
  name,
  description,
  provider,
  url,
}: {
  name: string;
  description: string;
  provider?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider || "EduGenius",
      sameAs: baseUrl,
    },
    url,
    isAccessibleForFree: true,
    inLanguage: "vi-VN",
  };
}
