import Button from "@mui/material/Button";
import { Row } from "components";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { checkFileSize, checkFileType, checkOneFileSelected } from "utils";

interface IImageForm {
  label: string;
  hasImg: boolean;
  setImg: (newImage: any) => void;
  rmImg: () => void;
}

const ImageForm = ({ label, hasImg, setImg, rmImg }: IImageForm) => {
  const toastError = useCallback((msg: string) => toast.error(msg), []);

  function removeImage(e: React.MouseEvent) {
    e?.stopPropagation();
    e?.preventDefault();
    rmImg();
  }

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    if (
      checkOneFileSelected(event, toastError) &&
      checkFileSize(event, toastError) &&
      checkFileType(event, toastError)
    ) {
      const file = event.target.files[0];
      setImg(file);
    }
  }

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
        onClick={hasImg ? removeImage : null}
      >
        {`${hasImg ? "Remove" : "Add"} ${label.toLowerCase()}`}
        {!hasImg && <input type="file" hidden onChange={handleImage} />}
      </Button>
    </Row>
  );
};

export default ImageForm;
