import TextField from "@mui/material/TextField";
import { forwardRef, MutableRefObject } from "react";

interface IMarkdownEditorProps {
  value: string;
  setValue: (val: string) => void;
  fullWidth: boolean;
  rows?: number;
  label?: string;
}

const MarkdownEditor = forwardRef<MutableRefObject<any>, IMarkdownEditorProps>(
  (props: IMarkdownEditorProps, ref?: MutableRefObject<any>) => {
    const {
      value = undefined,
      setValue,
      fullWidth,
      rows = 20,
      label = "Body",
    } = props;

    return (
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        label={label}
        multiline
        rows={rows}
        type="text"
        variant="outlined"
        style={{
          width: fullWidth ? "100%" : "calc(50% - 6px)",
          transition: "400ms",
        }}
        ref={ref}
      />
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
