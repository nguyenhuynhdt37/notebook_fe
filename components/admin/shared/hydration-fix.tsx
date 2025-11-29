"use client";

import { useEffect } from "react";

/**
 * Component để loại bỏ các attribute do browser extension thêm vào
 * (như bis_skin_checked từ Bitwarden) để tránh lỗi hydration
 */
export default function HydrationFix() {
  useEffect(() => {
    // Loại bỏ các attribute do extension thêm vào
    const removeExtensionAttributes = () => {
      // Loại bỏ từ body
      const body = document.body;
      if (body) {
        const attributesToRemove = [
          "bis_skin_checked",
          "bis_register",
          /^__processed_/,
        ];
        attributesToRemove.forEach((attr) => {
          if (typeof attr === "string") {
            if (body.hasAttribute(attr)) {
              body.removeAttribute(attr);
            }
          } else if (attr instanceof RegExp) {
            Array.from(body.attributes).forEach((attrNode) => {
              if (attr.test(attrNode.name)) {
                body.removeAttribute(attrNode.name);
              }
            });
          }
        });
      }

      // Loại bỏ từ tất cả các element khác
      const allElements = document.querySelectorAll("[bis_skin_checked]");
      allElements.forEach((el) => {
        el.removeAttribute("bis_skin_checked");
      });
    };

    // Chạy ngay lập tức
    removeExtensionAttributes();

    // Sử dụng MutationObserver để theo dõi và loại bỏ attribute ngay khi được thêm
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const target = mutation.target as Element;
          const attrName = mutation.attributeName;
          if (attrName) {
            // Loại bỏ các attribute do extension thêm vào
            if (
              attrName === "bis_skin_checked" ||
              attrName === "bis_register" ||
              attrName.startsWith("__processed_")
            ) {
              target.removeAttribute(attrName);
            }
          }
        } else if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Loại bỏ các attribute do extension thêm vào
              if (element.hasAttribute("bis_skin_checked")) {
                element.removeAttribute("bis_skin_checked");
              }
              if (element.hasAttribute("bis_register")) {
                element.removeAttribute("bis_register");
              }
              Array.from(element.attributes).forEach((attr) => {
                if (attr.name.startsWith("__processed_")) {
                  element.removeAttribute(attr.name);
                }
              });
              // Kiểm tra các element con
              const children = element.querySelectorAll(
                "[bis_skin_checked], [bis_register]"
              );
              children.forEach((el) => {
                el.removeAttribute("bis_skin_checked");
                el.removeAttribute("bis_register");
              });
            }
          });
        }
      });
      // Chạy lại để đảm bảo không bỏ sót
      removeExtensionAttributes();
    });

    // Bắt đầu quan sát toàn bộ document
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      // Không filter để bắt tất cả attribute changes
    });

    // Chạy lại sau một khoảng thời gian ngắn để bắt các element được thêm sau
    const timeouts = [
      setTimeout(removeExtensionAttributes, 0),
      setTimeout(removeExtensionAttributes, 100),
      setTimeout(removeExtensionAttributes, 500),
    ];

    // Cleanup
    return () => {
      observer.disconnect();
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return null;
}
