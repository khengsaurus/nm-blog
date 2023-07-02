import { MarkdownEditor, MarkdownViewer, Row } from "components";
import React, { CSSProperties } from "react";

interface IEditAndPreviewProps {
  body: string;
  markdown: boolean;
  label: string;
  setBody: (b: string) => void;
  style?: CSSProperties;
}

const EditPreviewMarkdown = ({
  body,
  markdown,
  label,
  setBody,
  style = {},
}: IEditAndPreviewProps) => {
  return (
    <Row style={{ alignItems: "flex-start", ...style }}>
      <MarkdownEditor
        label={label}
        value={body}
        setValue={setBody}
        fullWidth={!markdown}
      />
      <MarkdownViewer
        text={markdown ? body : ""}
        markdown={markdown}
        height={447}
      />
    </Row>
  );
};

export default EditPreviewMarkdown;
