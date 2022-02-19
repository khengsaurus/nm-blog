import { motion } from "framer-motion";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Fade, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import sources from "../../PhotosDB";
import React from "react";
import Image from "next/image";

interface IPhotoPageProps {
  photo: number;
  photoId: number;
}

export async function getServerSideProps({ params }) {
  const { photoId } = params;

  return {
    props: { photoId },
  };
}

const PhotoPage = ({ photoId }: IPhotoPageProps) => {
  const router = useRouter();
  const item = sources[photoId];

  return (
    <main className="column">
      <Fade in={true} unmountOnExit={true}>
        <IconButton
          className="icon-button"
          onClick={() => router.back()}
          disableRipple
          style={{ alignSelf: "flex-start" }}
        >
          <ChevronLeftIcon fontSize={"medium"} style={{ color: "white" }} />
        </IconButton>
      </Fade>
      <motion.h2
        layoutId={`title-${photoId}`}
      >{`Lorem ipsum ${photoId}`}</motion.h2>
      <motion.figure layoutId={`image-${photoId}`}>
        <Image
          alt=""
          src={item.photo}
          width={400}
          height={400}
          objectFit="contain"
        />
      </motion.figure>
    </main>
  );
};

export default PhotoPage;
