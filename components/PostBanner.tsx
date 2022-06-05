import { motion } from "framer-motion";
import { useDocumentListener } from "hooks";
import Image from "next/image";
import React, { useCallback, useState } from "react";

interface IPostBanner {
  src?: string;
  id?: string;
  paddingPx?: number;
}

const PostBanner = ({ src, id }: IPostBanner) => {
  const [view, setView] = useState(false);

  const handleCloseCallback = useCallback((e) => {
    if (e.key === "Escape") setView(false);
  }, []);

  useDocumentListener("keydown", handleCloseCallback);

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
      <div
        className={`transparent-overlay ${view ? "" : "hide"}`}
        onClick={() => setView(false)}
      >
        <Image
          alt="post-full-image"
          src={src}
          layout="fill"
          objectFit="contain"
        />
      </div>
    </>
  ) : null;
};

export default PostBanner;
