import { MarkdownEditor, MarkdownViewer, Row } from "components";
import React from "react";

interface IEditAndPreviewProps {
  body: string;
  hasMarkdown: boolean;
  setBody: (b: string) => void;
}

const EditPreviewMarkdown = ({
  body,
  hasMarkdown,
  setBody,
}: IEditAndPreviewProps) => {
  return (
    <Row style={{ alignItems: "flex-start" }}>
      <MarkdownEditor
        value={body}
        setValue={setBody}
        fullWidth={!hasMarkdown}
      />
      <MarkdownViewer
        text={hasMarkdown ? body : ""}
        hasMarkdown={hasMarkdown}
        height={401}
      />
    </Row>
  );
};

export default EditPreviewMarkdown;
