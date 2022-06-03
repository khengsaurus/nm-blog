import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Row, StyledText } from "components";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IImageForm {
  newImage: any;
  setNewImage: (image: any) => void;
  imageName?: string;
  setImageName?: (imageName: string) => void;
}

const ImageForm = ({
  newImage,
  setNewImage,
  imageName,
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
        Add image
        <input type="file" hidden onChange={handleAttachment} />
      </Button>
      {(!!newImage || imageName) && (
        <Row style={{ justifyContent: "flex-end" }}>
          <StyledText variant="body1" text={newImage?.name || imageName} />
          <IconButton
            edge="end"
            aria-label="delete-image"
            onClick={() => {
              setImageName("");
              setNewImage(null);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Row>
      )}
    </Row>
  );
};

export default ImageForm;
