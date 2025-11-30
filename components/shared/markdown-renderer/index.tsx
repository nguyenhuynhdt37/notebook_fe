"use client";

import "highlight.js/styles/github-dark.css";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItTaskLists from "markdown-it-task-lists";
import { useEffect, useMemo, useRef } from "react";
import "./markdown.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /**
   * Nếu true, content được coi là HTML sẵn, không parse markdown
   * Mặc định: false (parse markdown)
   */
  isHtml?: boolean;
}

// ⚙️ Markdown → HTML converter (markdown-it + GFM) - giống TiptapEditor
const parseMarkdownToHTML = (markdown: string): string => {
  if (!markdown || !markdown.trim()) return "";
  if (markdown.trim().startsWith("<")) return markdown;

  // Khởi tạo markdown-it (GFM-ish)
  const md = new MarkdownIt({
    html: false, // không cho HTML thô (an toàn hơn)
    linkify: true, // tự link URL
    breaks: true, // xuống dòng = <br>
    typographer: false,
  })
    .use(markdownItTaskLists, { enabled: true, label: true })
    .use(markdownItAttrs)
    .use(markdownItAnchor, { permalink: false });

  // Xử lý underline syntax: __text__ -> <u>text</u>
  // Placeholder underline để không đụng vào **bold**
  const U_PLACE = "___UNDERLINE_PLACEHOLDER___";
  const map = new Map<string, string>();
  let idx = 0;

  // Bắt __text__ khi KHÔNG phải **text**
  // - không ăn vào chữ có gạch dưới trong từ
  // - giữ nguyên khoảng trắng đầu/cuối
  const processed = markdown.replace(
    /(^|[\s([>])__(?!\*)([^_\n][^_]*?[^_\n])__(?=$|[\s\])<.,!?:;])/g,
    (match, before, content) => {
      const ph = `${U_PLACE}_${idx++}`;
      map.set(ph, `<u>${content}</u>`);
      return `${before}${ph}`;
    }
  );

  // Render markdown
  let html = md.render(processed);

  // Thay placeholder về underline tags
  for (const [ph, val] of map.entries()) {
    // dùng split/join thay vì RegExp để tránh escape
    html = html.split(ph).join(val);
  }

  return html;
};

export default function MarkdownRenderer({
  content,
  className = "",
  isHtml = false,
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse markdown sang HTML hoặc sử dụng HTML trực tiếp
  // Dùng useMemo để tránh parse lại khi không cần thiết
  const htmlContent = useMemo(() => {
    if (!content || !content.trim()) {
      return "";
    }

    if (isHtml) {
      // Nếu là HTML sẵn, trả về trực tiếp
      return content;
    }

    // Parse markdown thành HTML
    try {
      const parsed = parseMarkdownToHTML(content);
      return parsed || "";
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return content; // Fallback: trả về content gốc nếu parse lỗi
    }
  }, [content, isHtml]);

  useEffect(() => {
    // Highlight code blocks sau khi render
    const highlightCodeBlocks = async () => {
      if (!containerRef.current || !htmlContent) return;

      const codeBlocks = containerRef.current.querySelectorAll("pre code");
      if (codeBlocks.length === 0) return;

      try {
        // Dynamic import highlight.js nếu chưa có
        if (typeof window !== "undefined" && !(window as any).hljs) {
          const hljs = (await import("highlight.js")).default;
          codeBlocks.forEach((block) => {
            try {
              hljs.highlightElement(block as HTMLElement);
            } catch (e) {
              console.warn("Error highlighting code block:", e);
            }
          });
        } else if ((window as any).hljs) {
          codeBlocks.forEach((block) => {
            try {
              (window as any).hljs.highlightElement(block);
            } catch (e) {
              console.warn("Error highlighting code block:", e);
            }
          });
        }
      } catch (error) {
        console.warn("Error loading highlight.js:", error);
      }
    };

    // Delay một chút để đảm bảo DOM đã render hoàn toàn
    const timer = setTimeout(() => {
      highlightCodeBlocks();
    }, 150);

    return () => clearTimeout(timer);
  }, [htmlContent]);

  // Empty content
  if (!content || !content.trim() || !htmlContent) {
    return (
      <div
        className={`tiptap-editor-content markdown-content ${className}`}
        style={{ minHeight: "auto", height: "auto" }}
      >
        <p className="text-gray-400 italic">Không có nội dung</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`tiptap-editor-content markdown-content prose prose-sm max-w-none ${className}`}
      style={{ minHeight: "auto", height: "auto" }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
