import { Container } from "@mui/system";
import { AppContext, useMarkdown } from "hooks";
import { useContext } from "react";

interface IMarkdownViewerProps {
  text: string;
  height?: string | number;
  markdown?: boolean;
}

const MarkdownViewer = ({ text, height, markdown }: IMarkdownViewerProps) => {
  const { theme } = useContext(AppContext);
  const __html = useMarkdown(markdown, theme?.name, text);

  return (
    <Container
      className={`markdown-preview ${markdown ? "show" : "hide"}`}
      style={{ height }}
      dangerouslySetInnerHTML={{ __html }}
    />
  );
};

export default MarkdownViewer;
