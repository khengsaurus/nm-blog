import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import React, { useContext } from "react";
import { AppContext } from "../hooks";
import { IPost } from "../types";

interface IPostCard {
  post: IPost;
}

const PostCard = ({ post }: IPostCard) => {
  const { router } = useContext(AppContext);
  const { title, slug, body, user } = post;

  return (
    <Card onClick={() => router.push(`/${user?.username}/${slug}`)}>
      <CardMedia
        component="img"
        height="80"
        image="https://images.unsplash.com/photo-1493673272479-a20888bcee10"
        alt="plant"
      />
      <CardContent>
        <div className="card-content">
          <h2>{title}</h2>
          <p className="author">{`By ${user?.username}`}</p>
          <p className="body">
            {body?.slice(0, 90) + (body?.length > 90 ? "..." : "")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
