import React from "react";
import { IPost } from "../types";
import { StyledText } from "./StyledMui";

const PostCard = (post: IPost) => {
  const { title, slug, body, user } = post;

  return (
    <div className="card">
      <StyledText text={title} />
    </div>
  );
};

export default PostCard;
