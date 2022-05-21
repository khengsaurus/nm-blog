import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
        <CardMedia
          component="img"
          height="80"
          image={`${serverUrl}/api/images?key=${imageKey}`}
          alt="post-banner"
        />
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
