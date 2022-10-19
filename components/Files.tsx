import AudioFileIcon from "@mui/icons-material/AudioFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import { CircleLoader, Column, Row, StyledText } from "components";
import { FileStatus, Size } from "enums";
import { AppContext } from "hooks";
import { downloadFile } from "lib/client/tasks";
import moment from "moment";
import { useContext } from "react";
import toast from "react-hot-toast";
import { IPostFile } from "types";

interface IFiles {
  files: IPostFile[];
  handleRemoveFile: (file: IPostFile) => void;
}

function Files({ files, handleRemoveFile }: IFiles) {
  const { theme } = useContext(AppContext);

  return (
    <div className="selected-files">
      {files.map((file) => {
        const { name, status, uploaded, key } = file;
        const isUploaded = status !== FileStatus.PENDING;
        const fileName = name || file.file?.name;
        if (!fileName) return null;

        const FileIcon = getIcon(fileName);
        return (
          <Row key={`${fileName}-${file.uploaded}`} className="file-card">
            <FileIcon style={{ color: theme.highlightColor }} />
            <Column className="text">
              <StyledText text={fileName} variant="h6" />
              <StyledText
                text={
                  (isUploaded ? (
                    <span style={{ display: "flex" }}>
                      <FileUploadIcon style={{ height: 14, width: 14 }} />
                      {moment(new Date(file.uploaded)).format("DD/MM/YY HH:mm")}
                    </span>
                  ) : (
                    <CircleLoader size={Size.XS} strokeWidth={6} />
                  )) as unknown as string
                }
                variant="body2"
              />
            </Column>
            <Row className="action-btns">
              {isUploaded && key && (
                <DownloadIcon
                  style={{ color: theme.highlightColor }}
                  onClick={() => downloadFile(fileName, key, toast.error)}
                />
              )}
              <DeleteIcon
                style={{ color: theme.highlightColor }}
                onClick={() => handleRemoveFile(file)}
              />
            </Row>
          </Row>
        );
      })}
    </div>
  );
}

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

export default Files;
