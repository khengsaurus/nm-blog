import DeleteIcon from "@mui/icons-material/Delete";
import { Button, IconButton } from "@mui/material";
import { Row, StyledText } from "components";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IImageForm {
  label: string;
  imageName?: string;
  setImageName?: (imageName: string) => void;
  setNewImage: (image: any) => void;
}

const ImageForm = ({
  label,
  imageName,
  setNewImage,
  setImageName,
}: IImageForm) => {
  const errHandler = (msg: string) => console.info(msg);

  async function handleAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      checkOneFileSelected(event, errHandler) &&
      checkFileSize(event, errHandler) &&
      checkFileType(event, errHandler)
    ) {
      const file = event.target.files[0];
      setNewImage(file);
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
        {label}
        <input type="file" hidden onChange={handleAttachment} />
      </Button>
      {imageName && (
        <Row style={{ justifyContent: "flex-end" }}>
          <StyledText variant="body1" text={imageName} />
          <IconButton
            edge="end"
            aria-label="delete-image"
            onClick={() => {
              setNewImage(null);
              setImageName("");
            }}
            disableRipple
          >
            <DeleteIcon />
          </IconButton>
        </Row>
      )}
    </Row>
  );
};

export default ImageForm;
