import { Fade } from "@mui/material";
import { motion } from "framer-motion";
import { useIsoEffect, useKeyListener } from "hooks";
import Image from "next/image";
import { useCallback, useState } from "react";

interface IPostBanner {
  imageKey: string;
  id: string;
}

const PostBanner = ({ imageKey, id }: IPostBanner) => {
  const [view, setView] = useState(false);
  const [width, setWidth] = useState(1000);

  useIsoEffect(() => {
    if (typeof window !== undefined) {
      const windowWidth = window.innerWidth - 40; // min padding
      setWidth(windowWidth);
    }
  }, []);

  const hideImage = useCallback(() => setView(false), []);
  useKeyListener("Escape", hideImage);

  return imageKey ? (
    <>
      <header className="banner-image">
        <motion.div
          layoutId={`banner-${id}`}
          style={{
            height: "100%",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => setView(true)}
        >
          <Image
            src={`${process.env.ENV_IMG_SRC}${imageKey}?tr=w-${width},h-400`}
            alt="post-banner-image"
            layout="fill"
            objectFit="cover"
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
