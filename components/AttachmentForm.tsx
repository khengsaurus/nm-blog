import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Row, StyledText } from "components";
import { useEffect, useState } from "react";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IAttachmentForm {
  attachment: any;
  setAttachment: (attachment: any) => void;
  imageName?: string;
}

const AttachmentForm = ({
  attachment,
  setAttachment,
  imageName,
}: IAttachmentForm) => {
  const [_imageName, setImageName] = useState("");
  const errHandler = (msg: string) => console.info(msg);

  useEffect(() => setImageName(imageName), [imageName]); // useState(imageName) being funny

  async function handleAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      checkOneFileSelected(event, errHandler) &&
      checkFileSize(event, errHandler) &&
      checkFileType(event, errHandler)
    ) {
      const file = event.target.files[0];
      setAttachment(file);
      setImageName(file.name);
    }
  }

  return (
    <Row>
      <Button
        disableRipple
        component="label"
        style={{
          height: "40px",
          width: "120px",
          padding: "0px",
          justifyContent: "flex-start",
          textTransform: "capitalize",
          marginLeft: 10,
        }}
      >
        Add image
        <input type="file" hidden onChange={handleAttachment} />
      </Button>
      {(!!attachment || _imageName) && (
        <Row style={{ justifyContent: "flex-end" }}>
          <StyledText variant="body1" text={attachment?.name || imageName} />
          <IconButton
            edge="end"
            aria-label="delete-image"
            onClick={() => {
              setImageName("");
              setAttachment(null);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Row>
      )}
    </Row>
  );
};

export default AttachmentForm;
