import { Container } from "@mui/system";
import { marked } from "marked";
import React from "react";
import sanitizeHtml from "sanitize-html";
// import hljs from "highlight.js";

// marked.setOptions({
//   langPrefix: "hljs language-",
//   renderer: new marked.Renderer(),
//   highlight: function (code, language) {
//     const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
//     return hljs.highlight(validLanguage, code).value.replace(/&amp;/g, "&");
//   },
// });

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "h1",
  "h2",
  "h3",
]);

const allowedAttributes = Object.assign(
  {},
  sanitizeHtml.defaults.allowedAttributes,
  {
    img: ["alt", "src"],
  }
);

interface IMarkdownViewerProps {
  text: string;
  height?: string | number;
  hasMarkdown?: boolean;
}

const MarkdownViewer = ({
  text,
  height,
  hasMarkdown,
}: IMarkdownViewerProps) => {
  return (
    <Container
      className={`markdown-viewer ${hasMarkdown ? "show" : "hide"}`}
      style={{ height }}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(marked(text), {
          allowedTags,
          allowedAttributes,
        }),
      }}
    />
  );
};

export default MarkdownViewer;
