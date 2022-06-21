import { useState } from "react";
import useIsoEffect from "./useIsoEffect";

const usePreviewImg = (
  targetId: string,
  image: File,
  autoHide = true,
  delay = 50
) => {
  const [showing, setShowing] = useState(false);

  useIsoEffect(() => {
    let fileReader: FileReader = null;
    let isCancel = false;
    if (!image) {
      const target = document?.getElementById(targetId) as HTMLImageElement;
      if (target) {
        if (autoHide) {
          target.src = "";
          target.style.display = "none";
        }
        setShowing(false);
      }
    } else if (!showing) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result && !isCancel) {
          setTimeout(() => {
            const target = document?.getElementById(
              targetId
            ) as HTMLImageElement;
            if (target) {
              target.src = result as string;
              target.style.display = "block";
              setShowing(true);
            }
          }, delay);
        }
      };
      fileReader.readAsDataURL(image);
    }

    return () => {
      isCancel = true;
      if (fileReader?.readyState === 1) fileReader.abort();
    };
  }, [image]);

  return showing;
};

export default usePreviewImg;
