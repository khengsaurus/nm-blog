import { marked } from "marked";
import hljs from "highlight.js";

function getCodeTheme(themeName: string) {
  switch (themeName) {
    case "blue":
      return "colorBrewer";
    case "dark":
    case "embers":
      return "github";
    case "lavendar":
      return "dracula";
    case "light":
      return "solarLight";
    case "cactus":
      return "atomOneDark";
    case "cabana":
    case "moss":
      return "monokaiSublime";
    default:
      return themeName;
  }
}

function markdown(text: string, themeName: string) {
  const codeTheme = getCodeTheme(themeName);
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
      hljs.configure(themeName ? { classPrefix: `${codeTheme}-` } : null);
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: `hljs ${codeTheme} language-`,
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
  });
  return marked.parse(text);
}

export default markdown;
