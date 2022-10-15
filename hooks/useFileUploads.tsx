import Button from "@mui/material/Button";
import { Row } from "components";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { checkFileSize } from "utils";

const useFileUploads = () => {
  const [files, setFiles] = useState<File[]>([]);
  const toastError = useCallback((msg: string) => toast.error(msg), []);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (checkFileSize(event, toastError)) {
      setFiles((files) => [...files, ...event.target.files]);
    }
  }

  function renderSelectFile() {
    return (
      <Row>
        <Button
          disableRipple
          component="label"
          style={{
            height: "40px",
            width: "200px",
            padding: "0px",
            justifyContent: "flex-start",
            textTransform: "initial",
            marginLeft: 10,
          }}
        >
          Add files
          <input type="file" hidden onChange={handleFiles} />
        </Button>
      </Row>
    );
  }

  function renderSelectedFiles() {
    return (
      <Row style={{ justifyContent: "flex-start" }}>
        {files.map((f) => (
          <div
            key={f.name}
            style={{ width: 200, height: 40, border: "1px solid indianred" }}
          >
            {f.name}
          </div>
        ))}
      </Row>
    );
  }

  function addFiles(newFiles: File[]) {
    setFiles((files) => [...files, ...newFiles]);
  }

  return { addFiles, renderSelectFile, renderSelectedFiles };
};

export default useFileUploads;
