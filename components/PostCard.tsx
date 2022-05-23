import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { motion } from "framer-motion";
import React, { useContext } from "react";
import { AppContext } from "../hooks";
import { IPost } from "../types";
import AuthorLink from "./AuthorLink";

interface IPostCard {
  post: IPost;
  hasAuthorLink?: boolean;
}

const PostCard = ({ post, hasAuthorLink = true }: IPostCard) => {
  const { router } = useContext(AppContext);
  const { title, slug, body, user, imageKey, id } = post;

  return (
    <Card onClick={() => router.push(`/${user?.username}/${slug}`)}>
      {imageKey && (
        <CardMedia>
          <motion.img
            src={`api/images?key=${imageKey}`}
            alt="post-image"
            layoutId={`${id}-banner`}
            style={{
              height: "80px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "50% 40%",
            }}
          />
        </CardMedia>
      )}
      <CardContent style={{ height: imageKey ? 105 : 185 }}>
        <div className="card-content">
          {/* <motion.h2 layoutId={`${id}-title`}>{title}</motion.h2> */}
          <h2>{title}</h2>
          {hasAuthorLink && <AuthorLink author={user} />}
          <p className={`body ${imageKey ? "short" : "long"}`}>{body}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
