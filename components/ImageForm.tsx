import { Button } from "@mui/material";
import { Row } from "components";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IImageForm {
  label: string;
  hasImage: boolean;
  setImage: (newImage: any) => void;
  setImageKey: (newImageKey: string) => void;
  newImage?: File;
}

const ImageForm = ({ label, hasImage, setImage, setImageKey }: IImageForm) => {
  const toastError = useCallback((msg: string) => toast.error(msg), []);
  function removeImage(e: React.MouseEvent) {
    e?.stopPropagation();
    e?.preventDefault();
    setImage(null);
    setImageKey("");
  }

  async function handleAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      checkOneFileSelected(event, toastError) &&
      checkFileSize(event, toastError) &&
      checkFileType(event, toastError)
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
