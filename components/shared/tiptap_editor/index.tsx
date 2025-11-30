"use client";

import api from "@/api/client/axios";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github-dark.css";
import { createLowlight } from "lowlight";
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownItTaskLists from "markdown-it-task-lists";
import { useEffect, useRef, useState } from "react";
import {
  FaBold,
  FaItalic,
  FaListOl,
  FaListUl,
  FaQuoteLeft,
  FaRedo,
  FaStrikethrough,
  FaTable,
  FaTasks,
  FaUndo,
} from "react-icons/fa";
import {
  HiCode,
  HiDocumentText,
  HiLink,
  HiMinus,
  HiPhotograph,
} from "react-icons/hi";
import {
  MdFormatAlignCenter,
  MdFormatAlignJustify,
  MdFormatAlignLeft,
  MdFormatAlignRight,
} from "react-icons/md";
import TurndownService from "turndown";
import "./editor.css";
// ⚙️ Khởi tạo highlight.js
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);
lowlight.register("c", c);
lowlight.register("cpp", cpp);
lowlight.register("java", java);
lowlight.register("css", css);
lowlight.register("html", html);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.register("sql", sql);

// ⚙️ HTML → Markdown converter
const turndown = new TurndownService({
  codeBlockStyle: "fenced", // Sử dụng ``` thay vì indented
  fence: "```", // Sử dụng ``` cho code blocks
});
turndown.addRule("underline", {
  filter: ["u"],
  replacement: function (content) {
    return "__" + content + "__";
  },
});
// Thêm rule để preserve code blocks tốt hơn
turndown.addRule("codeBlock", {
  filter: function (node): boolean {
    return (
      node.nodeName === "PRE" &&
      !!node.firstChild &&
      node.firstChild.nodeName === "CODE"
    );
  },
  replacement: function (content, node) {
    const codeNode = node as HTMLElement;
    const codeElement = codeNode.querySelector("code");
    const language = codeElement?.className?.replace(/^language-/, "") || "";
    const code = codeElement?.textContent || content;
    // Nếu không có language hoặc là "plaintext", không thêm language identifier
    if (!language || language === "plaintext") {
      return `\n\`\`\`\n${code}\n\`\`\`\n`;
    }
    return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
  },
});

// ⚙️ Markdown → HTML converter (markdown-it + GFM)
const parseMarkdownToHTML = (markdown: string): string => {
  if (!markdown || !markdown.trim()) return "";

  // Nếu đã là HTML, return luôn
  if (markdown.trim().startsWith("<")) return markdown;

  // Xử lý nếu là JSON string được escape (từ AI API)
  // Ví dụ: "{\n  \"topic_description\": \"## Title\\nContent\"\n}"
  let processedMarkdown = markdown;
  if (
    typeof processedMarkdown === "string" &&
    processedMarkdown.trim().startsWith("{")
  ) {
    try {
      const parsed = JSON.parse(processedMarkdown);
      if (parsed && typeof parsed === "object" && parsed.topic_description) {
        processedMarkdown = parsed.topic_description;
      } else if (typeof parsed === "string") {
        processedMarkdown = parsed;
      }
    } catch {
      // Nếu không parse được, giữ nguyên
    }
  }

  // Normalize markdown: chuẩn hóa line breaks
  const normalized = processedMarkdown
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // 1) Khởi tạo markdown-it (GFM-ish)
  const md = new MarkdownIt({
    html: false, // không cho HTML thô (an toàn hơn; đổi true nếu bạn cần)
    linkify: true, // tự link URL
    breaks: true, // xuống dòng = <br>
    typographer: false,
  })
    .use(markdownItTaskLists, { enabled: true, label: true })
    .use(markdownItAttrs)
    .use(markdownItAnchor, { permalink: false });

  // 2) Placeholder underline để không đụng vào **bold**
  const U_PLACE = "___UNDERLINE_PLACEHOLDER___";
  const map = new Map<string, string>();
  let idx = 0;

  // Bắt __text__ khi KHÔNG phải **text**
  // - không ăn vào chữ có gạch dưới trong từ
  // - giữ nguyên khoảng trắng đầu/cuối
  const processed = normalized
    // giữa câu hoặc bao quanh bởi khoảng trắng/ký tự đầu-cuối
    .replace(
      /(^|[\s([>])__(?!\*)([^_\n][^_]*?[^_\n])__(?=$|[\s\])<.,!?:;])/g,
      (_, before, content) => {
        const ph = `${U_PLACE}_${idx++}`;
        map.set(ph, `<u>${content}</u>`);
        return `${before}${ph}`;
      }
    );

  // 3) Render markdown-it
  let html = md.render(processed);

  // 4) Trả placeholder → <u>
  for (const [ph, val] of map.entries()) {
    // dùng split/join thay vì RegExp để tránh escape
    html = html.split(ph).join(val);
  }

  // 5) Thêm justify cho tất cả paragraph (khi AI đưa vào)
  // Wrap HTML trong một div tạm để parse
  const tempDiv =
    typeof document !== "undefined" ? document.createElement("div") : null;
  if (tempDiv) {
    tempDiv.innerHTML = html;
    // Tìm tất cả paragraph và thêm text-align: justify
    const paragraphs = tempDiv.querySelectorAll("p");
    paragraphs.forEach((p) => {
      (p as HTMLElement).style.textAlign = "justify";
    });
    html = tempDiv.innerHTML;
  } else {
    // Fallback cho SSR: dùng regex để thêm style vào <p>
    html = html.replace(/<p>/g, '<p style="text-align: justify;">');
  }

  return html;
};

interface TiptapEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  maxHeight?: string;
  minHeight?: string;
  showToolbar?: boolean; // Tùy chọn ẩn/hiện toolbar
  autoFocus?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  maxHeight,
  minHeight,
  showToolbar = true,
  autoFocus = false,
  onEditorReady,
}: TiptapEditorProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownValue, setMarkdownValue] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const hasAutoFocusedRef = useRef(false);
  const lastSyncedValueRef = useRef<string>("");

  const programmingLanguages = [
    { value: "plaintext", label: "Plain Text" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
    { value: "css", label: "CSS" },
    { value: "html", label: "HTML" },
    { value: "json", label: "JSON" },
    { value: "bash", label: "Bash" },
    { value: "sql", label: "SQL" },
  ];

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  const handleImageUpload = async (file: File, editorInstance: Editor) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 10MB.");
      return;
    }

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const imageUrl = await uploadImage(file);
      editorInstance.chain().focus().setImage({ src: imageUrl }).run();
      setUploadPreview(null);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể tải ảnh lên. Vui lòng thử lại.";
      alert(errorMsg);
      setUploadPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Strike,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "",
        HTMLAttributes: { class: "tiptap-code-block" },
      }),
      HorizontalRule,
      TaskList.configure({ HTMLAttributes: { class: "tiptap-task-list" } }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "tiptap-task-item" },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "tiptap-table" },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Markdown,
      Placeholder.configure({ placeholder }),
      Image.configure({
        HTMLAttributes: { class: "tiptap-image" },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "tiptap-link" },
      }),
    ],
    content: parseMarkdownToHTML(value || ""),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndown.turndown(html);
      lastSyncedValueRef.current = markdown;
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file && editorRef.current) {
            handleImageUpload(file, editorRef.current);
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (imageFile) {
          event.preventDefault();
          if (editorRef.current) {
            handleImageUpload(imageFile, editorRef.current);
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      onEditorReady?.(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor || !autoFocus || hasAutoFocusedRef.current) return;

    const timeout = setTimeout(() => {
      editor.chain().focus("end").run();
    }, 60);

    hasAutoFocusedRef.current = true;

    return () => clearTimeout(timeout);
  }, [editor, autoFocus]);

  // Sync value từ props vào state
  useEffect(() => {
    if (value !== undefined && value !== markdownValue) {
      setMarkdownValue(value);
    }
  }, [value]);

  // Helper: Normalize markdown để so sánh (loại bỏ whitespace thừa)
  const normalizeMarkdown = (md: string): string => {
    if (!md) return "";
    return md
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // Sync value vào editor khi không ở markdown mode
  useEffect(() => {
    if (!editor || isMarkdownMode || value === undefined) return;

    // Nếu value không thay đổi, không cần sync
    if (value === lastSyncedValueRef.current) return;

    // Detect nếu value là markdown format (có ##, **, etc.) hoặc không phải HTML
    const isMarkdownFormat =
      value.includes("##") ||
      value.includes("**") ||
      value.includes("__") ||
      value.includes("```") ||
      value.includes("- ") ||
      value.includes("* ") ||
      value.includes("1. ") ||
      (value.includes("\n") && !value.trim().startsWith("<"));

    if (isMarkdownFormat || !value.trim().startsWith("<")) {
      // Parse markdown thành HTML (đã có justify trong HTML)
      let htmlContent = parseMarkdownToHTML(value);
      if (htmlContent && htmlContent.trim()) {
        // Set content và lưu lại value đã sync
        editor.commands.setContent(htmlContent, { emitUpdate: false });

        // Sau khi set content, apply justify cho tất cả paragraph
        // (HTML đã có style justify, nhưng cần apply attribute cho TipTap)
        setTimeout(() => {
          // Select toàn bộ document và apply justify cho tất cả paragraph
          const { from, to } = { from: 0, to: editor.state.doc.content.size };
          editor
            .chain()
            .setTextSelection({ from, to })
            .setTextAlign("justify")
            .run();
        }, 10);

        lastSyncedValueRef.current = value;
      }
    } else {
      // Nếu là HTML, set trực tiếp
      editor.commands.setContent(value, { emitUpdate: false });

      // Apply justify cho tất cả paragraph
      setTimeout(() => {
        const { from, to } = { from: 0, to: editor.state.doc.content.size };
        editor
          .chain()
          .setTextSelection({ from, to })
          .setTextAlign("justify")
          .run();
      }, 10);

      lastSyncedValueRef.current = value;
    }
  }, [value, editor, isMarkdownMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLangMenu]);

  if (!editor) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
        Đang tải editor...
      </div>
    );
  }

  const currentLang = editor.getAttributes("codeBlock").language || "";

  const handleCopyCodeBlock = () => {
    const { from, to } = editor.state.selection;
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === "codeBlock") {
        const text = node.textContent;
        navigator.clipboard.writeText(text).then(() => {
          setCopiedCodeBlock(text);
          setTimeout(() => setCopiedCodeBlock(null), 2000);
        });
        return false;
      }
    });
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const handleToggleMarkdownMode = () => {
    if (isMarkdownMode) {
      // Chuyển từ Markdown → WYSIWYG
      if (editor) {
        const htmlContent = parseMarkdownToHTML(markdownValue);
        editor.commands.setContent(htmlContent);
      }
    } else {
      // Chuyển từ WYSIWYG → Markdown
      if (editor) {
        const html = editor.getHTML();
        const markdown = turndown.turndown(html);
        setMarkdownValue(markdown);
      }
    }
    setIsMarkdownMode(!isMarkdownMode);
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdownValue(newMarkdown);
    onChange(newMarkdown);
  };

  return (
    <div
      className="tiptap-editor-wrapper border rounded-lg overflow-hidden"
      style={{
        ...(maxHeight && {
          maxHeight,
          minHeight: minHeight || "auto",
          height: "auto",
          display: "flex",
          flexDirection: "column",
        }),
        ...(minHeight &&
          !maxHeight && {
            minHeight,
            display: "flex",
            flexDirection: "column",
          }),
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="tiptap-toolbar flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2 flex-shrink-0">
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="tiptap-toolbar-btn"
            title="Hoàn tác (Ctrl+Z)"
          >
            <FaUndo />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="tiptap-toolbar-btn"
            title="Làm lại (Ctrl+Y)"
          >
            <FaRedo />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("bold") ? "active" : ""
            }`}
            title="In đậm (Ctrl+B)"
          >
            <FaBold />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("italic") ? "active" : ""
            }`}
            title="In nghiêng (Ctrl+I)"
          >
            <FaItalic />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("strike") ? "active" : ""
            }`}
            title="Gạch ngang"
          >
            <FaStrikethrough />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`tiptap-toolbar-btn ${
              editor.isActive("heading", { level: 1 }) ? "active" : ""
            }`}
          >
            H1
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`tiptap-toolbar-btn ${
              editor.isActive("heading", { level: 2 }) ? "active" : ""
            }`}
          >
            H2
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`tiptap-toolbar-btn ${
              editor.isActive("heading", { level: 3 }) ? "active" : ""
            }`}
          >
            H3
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Text Align */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive({ textAlign: "left" }) ? "active" : ""
            }`}
            title="Căn trái"
          >
            <MdFormatAlignLeft />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive({ textAlign: "center" }) ? "active" : ""
            }`}
            title="Căn giữa"
          >
            <MdFormatAlignCenter />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive({ textAlign: "right" }) ? "active" : ""
            }`}
            title="Căn phải"
          >
            <MdFormatAlignRight />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive({ textAlign: "justify" }) ? "active" : ""
            }`}
            title="Căn đều"
          >
            <MdFormatAlignJustify />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("bulletList") ? "active" : ""
            }`}
            title="Danh sách không thứ tự"
          >
            <FaListUl />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("orderedList") ? "active" : ""
            }`}
            title="Danh sách có thứ tự"
          >
            <FaListOl />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("taskList") ? "active" : ""
            }`}
            title="Danh sách công việc"
          >
            <FaTasks />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`tiptap-toolbar-btn ${
              editor.isActive("blockquote") ? "active" : ""
            }`}
            title="Trích dẫn"
          >
            <FaQuoteLeft />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="tiptap-toolbar-btn"
            title="Đường kẻ ngang"
          >
            <HiMinus />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Markdown Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleMarkdownMode}
            className={`tiptap-toolbar-btn ${isMarkdownMode ? "active" : ""}`}
            title={
              isMarkdownMode
                ? "Chuyển sang chế độ WYSIWYG"
                : "Chuyển sang chế độ Markdown"
            }
          >
            <HiDocumentText />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Code block + language menu */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleCodeBlock({ language: currentLang })
                  .run()
              }
              className={`tiptap-toolbar-btn ${
                editor.isActive("codeBlock") ? "active" : ""
              }`}
              title="Code block"
            >
              <HiCode />
            </button>

            {editor.isActive("codeBlock") &&
              currentLang &&
              currentLang !== "plaintext" && (
                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="ml-1 rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                >
                  {currentLang.toUpperCase()}
                </button>
              )}

            {showLangMenu && (
              <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                {programmingLanguages.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      // Nếu chọn "plaintext", set language thành empty string
                      const language =
                        lang.value === "plaintext" ? "" : lang.value;
                      editor
                        .chain()
                        .focus()
                        .updateAttributes("codeBlock", { language })
                        .run();
                      setShowLangMenu(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                      currentLang === lang.value ||
                      (currentLang === "" && lang.value === "plaintext")
                        ? "bg-gray-100 font-semibold"
                        : ""
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Table */}
          <button
            type="button"
            onClick={insertTable}
            className="tiptap-toolbar-btn"
            title="Chèn bảng"
          >
            <FaTable />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Link */}
          {editor.isActive("link") ? (
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
              }}
              className="tiptap-toolbar-btn active"
              title="Xóa liên kết"
            >
              <HiLink />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const url = prompt("Nhập URL:");
                if (url && url.trim()) {
                  editor
                    .chain()
                    .focus()
                    .setLink({ href: url, target: "_blank" })
                    .run();
                }
              }}
              className="tiptap-toolbar-btn"
              title="Chèn liên kết"
            >
              <HiLink />
            </button>
          )}

          {/* Image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && editor) {
                handleImageUpload(file, editor);
              }
              // Reset input để có thể chọn lại file cùng tên
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="tiptap-toolbar-btn"
            title="Chèn ảnh"
            disabled={isUploading}
          >
            <HiPhotograph />
          </button>
        </div>
      )}

      {/* Editor */}
      {isMarkdownMode ? (
        <div
          className="tiptap-editor-container prose max-w-none p-4 overflow-y-auto flex-1"
          style={maxHeight ? { maxHeight: "none", minHeight: 0 } : {}}
        >
          <textarea
            value={markdownValue}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full resize-none border-none outline-none font-mono text-sm leading-relaxed bg-transparent text-gray-800 whitespace-pre"
            style={{
              fontFamily:
                '"Fira Code", "Consolas", "Monaco", "Courier New", monospace',
              minHeight: minHeight || "400px",
              ...(maxHeight && { maxHeight, height: "auto" }),
              whiteSpace: "pre",
              tabSize: 2,
            }}
            spellCheck={false}
          />
        </div>
      ) : (
        <div
          className="tiptap-editor-container prose max-w-none p-4 overflow-y-auto flex-1 relative"
          style={maxHeight ? { maxHeight: "none", minHeight: 0 } : {}}
        >
          <div className="tiptap-editor-content">
            <EditorContent editor={editor} />
          </div>

          {/* Upload Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
              <div className="bg-white rounded-xl border border-green-200 shadow-lg p-6 max-w-sm w-full mx-4">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Đang tải ảnh lên...
                  </h3>
                  {uploadPreview && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-green-200">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-4">
                    Vui lòng đợi trong giây lát
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
