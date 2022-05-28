import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface IPostBanner {
  src?: string;
  id?: string;
  paddingPx?: number;
}

const PostBanner = ({ src, id }: IPostBanner) => {
  return src ? (
    <header className="banner-image">
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
        layoutId={`banner-${id}`}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          objectPosition: "50% 40%",
        }}
      />
    </header>
  ) : null;
};

export default PostBanner;
