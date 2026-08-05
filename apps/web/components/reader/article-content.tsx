"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import rust from "highlight.js/lib/languages/rust";
import xml from "highlight.js/lib/languages/xml";

import type { TocItem } from "@/lib/reader/types";

hljs.registerLanguage("go", go);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("xml", xml);

function slugifyHeading(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || `section-${index}`;
}

function enhanceCodeBlocks(root: HTMLElement) {
  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.closest(".code-block")) return;

    const code = pre.querySelector("code");
    if (code) {
      const langClass = [...code.classList].find((c) => c.startsWith("language-"));
      if (langClass) {
        const lang = langClass.replace("language-", "");
        if (hljs.getLanguage(lang)) {
          hljs.highlightElement(code);
        }
      } else {
        hljs.highlightElement(code);
      }
    }

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "code-copy";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      const text = pre.textContent ?? "";
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 2000);
    });
    wrapper.appendChild(copyBtn);
  });
}

function uniqueHeadingId(
  root: HTMLElement,
  heading: Element,
  text: string,
  index: number,
  usedIds: Set<string>,
): string {
  const base = slugifyHeading(text, index);
  let id = heading.id || base;
  let suffix = 1;

  while (usedIds.has(id) || idTakenByOther(root, heading, id)) {
    id = `${base}-${suffix++}`;
  }

  usedIds.add(id);
  return id;
}

function idTakenByOther(
  root: HTMLElement,
  heading: Element,
  id: string,
): boolean {
  const existing = root.querySelector(`#${CSS.escape(id)}`);
  return existing != null && existing !== heading;
}

function buildToc(root: HTMLElement): TocItem[] {
  const items: TocItem[] = [];
  const usedIds = new Set<string>();
  const headings = root.querySelectorAll("h2, h3");

  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim();
    if (!text) return;

    const level = heading.tagName === "H2" ? 2 : 3;
    const id = uniqueHeadingId(root, heading, text, index, usedIds);
    heading.id = id;
    items.push({ id, text, level });
  });

  return items;
}

type ArticleContentProps = {
  html: string;
  onTocChange: (items: TocItem[]) => void;
  contentRef: React.RefObject<HTMLElement | null>;
};

export function ArticleContent({
  html,
  onTocChange,
  contentRef,
}: ArticleContentProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [selectionHint, setSelectionHint] = useState(false);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (contentRef) {
        (contentRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [contentRef],
  );

  useEffect(() => {
    const root = innerRef.current;
    if (!root) return;

    enhanceCodeBlocks(root);
    onTocChange(buildToc(root));
  }, [html, onTocChange]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !innerRef.current) return;

    const range = selection.getRangeAt(0);
    if (!innerRef.current.contains(range.commonAncestorContainer)) return;

    setSelectionHint(true);
    setTimeout(() => setSelectionHint(false), 2000);
  }, []);

  const highlightSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!innerRef.current?.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("mark");
    span.className = "reader-highlight";
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
    } catch {
      // Partial selections across block elements cannot be wrapped
    }
  }, []);

  return (
    <div className="relative">
      {selectionHint && (
        <div className="absolute -top-10 right-0 z-10">
          <button
            type="button"
            onClick={highlightSelection}
            className="rounded-lg border border-border/60 bg-popover px-3 py-1.5 text-[12px] text-foreground shadow-lg"
          >
            Highlight
          </button>
        </div>
      )}

      <div
        ref={setRefs}
        className="reader-body"
        dangerouslySetInnerHTML={{ __html: html }}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
