import { Fade } from "@mui/material";
import { motion } from "framer-motion";
import { useKeyListener } from "hooks";
import Image from "next/image";
import { Fragment, useCallback, useState } from "react";

interface IPostBanner {
  src: string;
  id: string;
}

const PostBanner = ({ src, id }: IPostBanner) => {
  const [view, setView] = useState(false);

  const hideImage = useCallback(() => setView(false), []);
  useKeyListener("Escape", hideImage);

  return src ? (
    <>
      <header className="banner-image">
        <motion.img
          src={src}
          alt="post-banner-image"
          layoutId={`banner-${id}`}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            objectPosition: "50% 40%",
            cursor: "pointer",
          }}
          onClick={() => setView(true)}
        />
      </header>
      <Fade in={view} unmountOnExit onClick={hideImage}>
        <div className={"transparent-overlay"}>
          <Image
            alt="post-full-image"
            src={src}
            layout="fill"
            objectFit="contain"
          />
        </div>
      </Fade>
    </>
  ) : null;
};

export default PostBanner;
