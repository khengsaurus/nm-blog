import { Container } from "@mui/system";
import { AppContext, useMarkdown } from "hooks";
import { useContext } from "react";

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
  const { theme } = useContext(AppContext);
  const markdown = useMarkdown(hasMarkdown, theme, text);

  return (
    <Container
      className={`markdown-preview ${hasMarkdown ? "show" : "hide"}`}
      style={{ height }}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
};

export default MarkdownViewer;
