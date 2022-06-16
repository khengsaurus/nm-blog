import { MarkdownEditor, MarkdownViewer, Row } from "components";
import React from "react";

interface IEditAndPreviewProps {
  body: string;
  hasMarkdown: boolean;
  label: string;
  setBody: (b: string) => void;
}

const EditPreviewMarkdown = ({
  body,
  hasMarkdown,
  label,
  setBody,
}: IEditAndPreviewProps) => {
  return (
    <Row style={{ alignItems: "flex-start" }}>
      <MarkdownEditor
        label={label}
        value={body}
        setValue={setBody}
        fullWidth={!hasMarkdown}
      />
      <MarkdownViewer
        text={hasMarkdown ? body : ""}
        hasMarkdown={hasMarkdown}
        height={447}
      />
    </Row>
  );
};

export default EditPreviewMarkdown;
