import { Button } from "@mui/material";
import { Row } from "components";
import { toast } from "react-hot-toast";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IImageForm {
  label: string;
  hasImage: boolean;
  setImage: (newImage: any) => void;
  setImageKey: (newImageKey: string) => void;
  newImage?: File;
}

const errorHandler = (msg: string) => toast.error(msg);

const ImageForm = ({ label, hasImage, setImage, setImageKey }: IImageForm) => {
  function removeImage(e: React.MouseEvent) {
    e?.stopPropagation();
    e?.preventDefault();
    setImage(null);
    setImageKey("");
  }

  async function handleAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      checkOneFileSelected(event, errorHandler) &&
      checkFileSize(event, errorHandler) &&
      checkFileType(event, errorHandler)
    ) {
      const file = event.target.files[0];
      setImage(file);
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
        onClick={hasImage ? removeImage : null}
      >
        {`${hasImage ? "Remove" : "Add"} ${label}`}
        {!hasImage && <input type="file" hidden onChange={handleAttachment} />}
      </Button>
    </Row>
  );
};

export default ImageForm;
