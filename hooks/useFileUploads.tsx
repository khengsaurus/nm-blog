import AudioFileIcon from "@mui/icons-material/AudioFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import Button from "@mui/material/Button";
import { Column, Row, StyledText } from "components";
import { IS_DEV, MAX_FILES, MAX_FILES_A, MAX_FILE_SIZE } from "consts";
import moment from "moment";
import React, { useCallback, useContext, useRef, useState } from "react";
import toast from "react-hot-toast";
import { INewFile, IPost, IUploadedFile, IUser } from "types";
import { checkFileSize } from "utils";
import { AppContext } from "./context";

const maxFileSize = MAX_FILE_SIZE * 1000 * 1000;

const useFileUploads = (user: IUser, post: IPost) => {
  const { theme } = useContext(AppContext);
  const [files, setFiles] = useState<Array<IUploadedFile | INewFile>>(
    post?.files || []
  );
  const fileKeysToRm = useRef<string[]>([]);
  const toastError = useCallback((msg: string) => toast.error(msg), []);
  const isAdmin = user?.isAdmin || IS_DEV;

  const handleAddFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (checkFileSize(event, toastError)) {
        const newFile: INewFile = {
          newFile: event.target.files[0],
          uploaded: new Date().valueOf(),
        };
        setFiles((files) => [...files, newFile]);
      }
    },
    [toastError]
  );

  const SelectFile = () => (
    <Button disableRipple component="label" className="add-files-label">
      Add files
      <input type="file" hidden onChange={handleAddFile} />
    </Button>
  );

  function Files() {
    return (
      <div className="selected-files">
        {files.map((f) => {
          let type = "new";
          let fileName = "";
          let fileKey = "";
          const file = (f["name"] || f["newFile"]) as string | File;
          if (typeof file === "string") {
            type = "uploaded";
            fileName = file;
            fileKey = file["key"];
          } else {
            fileName = file.name;
          }
          const FileIcon = getIcon(fileName);
          return (
            <Row key={`${fileName}-${f.uploaded}`} className="file-card">
              <FileIcon style={{ color: theme.highlightColor }} />
              <Column className="text">
                <StyledText text={fileName} variant="h6" />
                <StyledText
                  text={
                    (
                      <span style={{ display: "flex" }}>
                        <FileUploadIcon style={{ height: 14, width: 14 }} />
                        {moment(new Date(f.uploaded)).format("DD/MM/YY HH:mm")}
                      </span>
                    ) as unknown as string
                  }
                  variant="body2"
                />
              </Column>
              <Row className="action-btns">
                <DownloadIcon
                  style={{ color: theme.highlightColor }}
                  onClick={() => {}}
                />
                <DeleteIcon
                  style={{ color: theme.highlightColor }}
                  onClick={() => {
                    setFiles((files) => files.filter((file) => file !== f));
                    if (type === "uploaded" && fileKey) {
                      fileKeysToRm.current = [...fileKeysToRm.current, fileKey];
                    }
                  }}
                />
              </Row>
            </Row>
          );
        })}
      </div>
    );
  }

  function addFiles(newFiles: File[]) {
    const limitFiles = isAdmin ? MAX_FILES_A : MAX_FILES;
    let _limit = limitFiles - files.length + fileKeysToRm.current.length;
    const uploaded = new Date().valueOf();
    const sizeErr = newFiles.find((f) => f.size > maxFileSize);
    const files2 = [
      ...files,
      ...newFiles
        .filter((newFile, index) =>
          newFile.size <= maxFileSize ? index < _limit : ++_limit && false
        )
        .map((newFile) => {
          return { newFile, uploaded };
        }),
    ];
    setFiles(files2);
    if (sizeErr) {
      toast.error(`The maximum file size is ${MAX_FILE_SIZE}MB`);
    } else if (files2.length - files.length < newFiles.length) {
      toast.error(`Max ${limitFiles} files per post`);
    }
  }

  return {
    addFiles,
    SelectFile,
    Files,
    fileKeysToRm: fileKeysToRm.current,
  };
};

function getIcon(fileName: string) {
  const ns = fileName?.split(".");
  const ext = ns[ns.length - 1];
  switch (ext.toLowerCase()) {
    case "doc":
    case "docx":
    case "pdf":
    case "txt":
      return DescriptionIcon;
    case "mp3":
    case "m4a":
    case "flac":
      return AudioFileIcon;
    case "mp4":
    case "mov":
      return VideoFileIcon;
    case "heic":
    case "png":
    case "jpg":
    case "jpeg":
      return ImageIcon;
    case "zip":
      return FolderZipIcon;
    default:
      return InsertDriveFileIcon;
  }
}

export default useFileUploads;
