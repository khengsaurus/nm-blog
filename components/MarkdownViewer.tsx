import { Container } from "@mui/system";
import { markdown } from "lib/client";

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
      className={`markdown-preview ${hasMarkdown ? "show" : "hide"}`}
      style={{ height }}
      dangerouslySetInnerHTML={{ __html: markdown(text) }}
    />
  );
};

export default MarkdownViewer;
