import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { AuthorLink, Row } from "components";
import { motion } from "framer-motion";
import moment from "moment";
import React, { useContext } from "react";
import { AppContext } from "../hooks";
import { IPost } from "../types";

interface IPostCard {
  post: IPost;
  hasAuthorLink?: boolean;
  hasDate?: boolean;
  postTag?: string;
}

const PostCard = ({
  post,
  postTag = "",
  hasAuthorLink = true,
  hasDate = true,
}: IPostCard) => {
  const { router } = useContext(AppContext);
  const { title, slug, body, user, imageKey, updatedAt } = post;
  const date = moment(new Date(updatedAt)).format("DD/MM/YY");

  return (
    <Card onClick={() => router.push(`/${user?.username}/${slug}`)}>
      {imageKey && (
        <CardMedia>
          <motion.img
            src={`api/images?key=${imageKey}`}
            alt="post-image"
            layoutId={`banner-${imageKey}${postTag}`}
            style={{
              height: "80px",
              width: "100%",
              objectFit: "cover",
              objectPosition: "50% 40%",
            }}
          />
        </CardMedia>
      )}
      <CardContent
        style={{
          height: imageKey ? 105 : 185,
          borderTop: imageKey ? "none" : null,
        }}
      >
        <div className="card-content">
          <h6>{title}</h6>
          <Row style={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
            {hasAuthorLink && <AuthorLink author={user} />}
            {hasDate && <p className="date">{date}</p>}
          </Row>
          <p className={`body ${imageKey ? "short" : "long"}`}>{body}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
