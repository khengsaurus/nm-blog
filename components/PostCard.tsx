import React from "react";
import { IPost } from "../types";
import { StyledText } from "./StyledMui";

interface IPostCard {
  post: IPost;
}

const PostCard = ({ post }: IPostCard) => {
  const { title, slug, body, user } = post;

  return (
    <div className="card">
      <StyledText text={title} />
    </div>
  );
};

export default PostCard;
