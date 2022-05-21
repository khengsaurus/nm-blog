import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { motion } from "framer-motion";
import { serverUrl } from "lib/client";
import React, { useContext, useMemo } from "react";
import { AppContext } from "../hooks";
import { IPost } from "../types";

interface IPostCard {
  post: IPost;
}

const PostCard = ({ post }: IPostCard) => {
  const { router } = useContext(AppContext);
  const { title, slug, body, user, imageKey } = post;

  const { hasImage, wordLimit } = useMemo(() => {
    const hasImage = !!imageKey;
    const wordLimit = hasImage ? 50 : 150;
    return { hasImage, wordLimit };
  }, [imageKey]);

  return (
    <Card onClick={() => router.push(`/${user?.username}/${slug}`)}>
      {hasImage && (
        <CardMedia>
          <motion.img
            src={`${serverUrl}/api/images?key=${imageKey}`}
            alt="post-image"
            layoutId={imageKey}
            style={{
              height: "80px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "50% 40%",
            }}
          />
        </CardMedia>
      )}
      <CardContent style={{ height: hasImage ? 105 : 185 }}>
        <div className="card-content">
          <h2>{title}</h2>
          <p className="author">{`By ${user?.username}`}</p>
          <p className="body">
            {body?.slice(0, wordLimit) +
              (body?.length > wordLimit ? "..." : "")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
