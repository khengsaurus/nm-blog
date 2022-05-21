import { motion } from "framer-motion";
import React from "react";

interface IPostBanner {
  src?: string;
  id?: string;
  paddingPx?: number;
}

const PostBanner = ({ src, id, paddingPx = 56 }: IPostBanner) => {
  return src ? (
    <div
      style={{
        position: "relative",
        width: `calc(100vw - ${paddingPx}px)`,
        height: "400px",
      }}
    >
      {/* <Image
        src={src}
        alt="post-image"
        layout="fill"
        objectFit="cover"
        objectPosition={"50% 20%"}
        priority
      /> */}
      <motion.img
        src={src}
        alt="post-image"
        layoutId={id}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          objectPosition: "50% 40%",
        }}
      />
    </div>
  ) : null;
};

export default PostBanner;
