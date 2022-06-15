import TextField from "@mui/material/TextField";
import { forwardRef, MutableRefObject } from "react";

interface IMarkdownEditorProps {
  label: string;
  value: string;
  fullWidth: boolean;
  rows?: number;
  setValue: (val: string) => void;
}

const MarkdownEditor = forwardRef<MutableRefObject<any>, IMarkdownEditorProps>(
  (props: IMarkdownEditorProps, ref?: MutableRefObject<any>) => {
    const { label, value, fullWidth, rows = 16, setValue } = props;

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
