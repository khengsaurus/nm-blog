import { Fade } from "@mui/material";
import { motion } from "framer-motion";
import { AppContext, useKeyListener, useWindowDimensions } from "hooks";
import Image from "next/image";
import { useCallback, useContext, useState } from "react";
import { getBannerSrc, getCardSrc } from "utils";
import SuspenseImage from "./SuspenseImage";

interface IPostBanner {
  imageKey: string;
  id: string;
}

const PostBanner = ({ imageKey, id }: IPostBanner) => {
  const [view, setView] = useState(false);
  const { theme } = useContext(AppContext);
  const { width } = useWindowDimensions();
  const highlightColor = theme?.highlightColor;

  const hideImage = useCallback(() => setView(false), []);
  useKeyListener("Escape", hideImage);

  return imageKey ? (
    <>
      <header className="banner-image" style={{ borderColor: highlightColor }}>
        <motion.div
          layoutId={`banner-${id}`}
          style={{
            height: "100%",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => setView(true)}
        >
          <SuspenseImage
            fallback={getCardSrc(imageKey)}
            src={imageKey && width ? getBannerSrc(imageKey, width) : ""}
            alt="post-banner-image"
            priority
          />
        </motion.div>
      </header>
      <Fade in={view} unmountOnExit onClick={hideImage}>
        <div className={"transparent-overlay"}>
          <Image
            alt="post-full-image"
            src={`${process.env.ENV_IMG_SRC}${imageKey}`}
            layout="fill"
            objectFit="contain"
          />
        </div>
      </Fade>
    </>
  ) : null;
};

export default PostBanner;
