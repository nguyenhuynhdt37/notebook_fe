"use client";

import "highlight.js/styles/github-dark.css";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItTaskLists from "markdown-it-task-lists";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
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

  // Override link render để thêm target="_blank" cho tất cả link
  const defaultLinkRender =
    md.renderer.rules.link_open ||
    function (tokens: any, idx: any, options: any, env: any, self: any) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (
    tokens: any,
    idx: any,
    options: any,
    env: any,
    self: any
  ) {
    // Thêm target="_blank"
    const targetIndex = tokens[idx].attrIndex("target");
    if (targetIndex < 0) {
      tokens[idx].attrPush(["target", "_blank"]);
    } else {
      tokens[idx].attrs![targetIndex][1] = "_blank";
    }

    // Thêm rel="noopener noreferrer" cho security
    const relIndex = tokens[idx].attrIndex("rel");
    if (relIndex < 0) {
      tokens[idx].attrPush(["rel", "noopener noreferrer"]);
    } else {
      tokens[idx].attrs![relIndex][1] = "noopener noreferrer";
    }

    return defaultLinkRender(tokens, idx, options, env, self);
  };

  // Xử lý underline syntax: __text__ -> <u>text</u>
  // Placeholder underline để không đụng vào **bold**
  const U_PLACE = "___UNDERLINE_PLACEHOLDER___";
  const map = new Map<string, string>();
  let idx = 0;

  // Bắt __text__ khi KHÔNG phải **text**
  // - không ăn vào chữ có gạch dưới trong từ
  // - giữ nguyên khoảng trắng đầu/cuối
  const processed = markdown.replace(
    /(^|[\s([\>])__(?!\*)([^_\n][^_]*?[^_\n])__(?=$|[\s\])<.,!?:;])/g,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    if (!containerRef.current || !htmlContent) return;

    // Group consecutive images for grid layout
    const groupImages = () => {
      const container = containerRef.current;
      if (!container) return;

      // Find all paragraphs with images
      const paragraphsWithImages = Array.from(
        container.querySelectorAll("p:has(img)")
      ) as HTMLElement[];

      paragraphsWithImages.forEach((p) => {
        const images = Array.from(p.querySelectorAll("img")) as HTMLElement[];
        const textContent = p.textContent?.trim() || "";
        const hasOnlyImages = textContent === "" || images.length > 0;

        if (images.length >= 2 && hasOnlyImages) {
          // Multiple images - create grid
          p.style.display = "grid";
          p.style.gridTemplateColumns = "repeat(2, 1fr)";
          p.style.gap = "0.75rem";
          p.style.margin = "1em 0";
          p.style.textAlign = "left";
        } else if (images.length === 1) {
          // Single image - full width
          p.style.textAlign = "left";
          images[0].style.width = "100%";
          images[0].style.maxWidth = "100%";
        }
      });

      // Handle standalone images (not in paragraphs) - direct children
      const allStandaloneImages = Array.from(
        container.querySelectorAll("img")
      ).filter((img) => {
        const parent = img.parentElement;
        return parent && parent.tagName !== "P" && parent === container;
      }) as HTMLElement[];

      if (allStandaloneImages.length >= 2) {
        // Group consecutive standalone images
        let currentGroup: HTMLElement[] = [];
        const groups: HTMLElement[][] = [];

        allStandaloneImages.forEach((img, index) => {
          currentGroup.push(img);
          const nextImg = allStandaloneImages[index + 1];

          // If no next image or next image is not consecutive, finalize group
          if (!nextImg) {
            if (currentGroup.length >= 2) {
              groups.push([...currentGroup]);
            }
            currentGroup = [];
          } else {
            // Check if images are siblings
            const imgNextSibling = img.nextElementSibling;
            if (imgNextSibling !== nextImg) {
              if (currentGroup.length >= 2) {
                groups.push([...currentGroup]);
              }
              currentGroup = [];
            }
          }
        });

        // Wrap groups in grid containers
        groups.forEach((group) => {
          if (group.length < 2) return;

          const firstImg = group[0];
          const parent = firstImg.parentElement;
          if (!parent) return;

          const gridContainer = document.createElement("div");
          gridContainer.className = "chatbot-image-grid";

          // Insert grid container before first image
          parent.insertBefore(gridContainer, firstImg);

          // Move all images to grid container
          group.forEach((img) => {
            img.remove();
            gridContainer.appendChild(img);
          });
        });
      }
    };

    // Highlight code blocks sau khi render
    const highlightCodeBlocks = async () => {
      if (!containerRef.current) return;

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

    // Add click handlers to images for modal using event delegation
    const addImageClickHandlers = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;

      // Use event delegation on container
      const handleImageClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG") {
          e.preventDefault();
          e.stopPropagation();
          const imgElement = target as HTMLImageElement;
          const src =
            imgElement.src ||
            imgElement.getAttribute("src") ||
            imgElement.getAttribute("data-src");
          if (src) {
            setSelectedImage(src);
          }
        }
      };

      // Remove old handler if exists
      const oldHandler = (container as any).__imageClickHandler;
      if (oldHandler) {
        container.removeEventListener("click", oldHandler, true);
      }

      // Add new handler
      container.addEventListener("click", handleImageClick, true);
      (container as any).__imageClickHandler = handleImageClick;

      // Set cursor pointer for all images
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        imgElement.style.cursor = "pointer";
        imgElement.style.userSelect = "none";
      });
    };

    // Delay một chút để đảm bảo DOM đã render hoàn toàn
    const timer = setTimeout(() => {
      if (className.includes("chatbot-markdown")) {
        groupImages();
        // Add handlers after grouping to ensure all images have handlers
        setTimeout(() => {
          addImageClickHandlers();
        }, 50);
      } else {
        addImageClickHandlers();
      }
      highlightCodeBlocks();
    }, 150);

    return () => {
      clearTimeout(timer);
      // Cleanup: remove click handlers when component unmounts or content changes
      if (containerRef.current) {
        const container = containerRef.current;
        const handler = (container as any).__imageClickHandler;
        if (handler) {
          container.removeEventListener("click", handler, true);
          delete (container as any).__imageClickHandler;
        }
      }
    };
  }, [htmlContent, className]);

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
    <>
      <div
        ref={containerRef}
        className={`tiptap-editor-content markdown-content prose prose-sm max-w-none ${className}`}
        style={{ minHeight: "auto", height: "auto" }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/85 backdrop-blur-md" />
          <DialogContent
            className="!fixed !inset-0 !max-w-none !max-h-none !w-screen !h-screen !translate-x-0 !translate-y-0 !p-0 bg-transparent border-none overflow-hidden shadow-none z-[9999]"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
            {selectedImage && (
              <div
                className="relative w-full h-full flex items-center justify-center p-2"
                onClick={() => setSelectedImage(null)}
              >
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-[98vw] max-h-[98vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  style={{
                    transform: "scale(1.4)",
                    maxWidth: "calc(98vw / 1.4)",
                    maxHeight: "calc(98vh / 1.4)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="absolute top-4 right-4 p-3 rounded-full bg-black/80 hover:bg-black/95 text-white transition-all z-10 shadow-xl backdrop-blur-sm hover:scale-110"
                  aria-label="Đóng"
                >
                  <X className="size-6" />
                </button>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
