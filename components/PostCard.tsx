import { CardMedia } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { AuthorLink, Row } from "components";
import { motion } from "framer-motion";
import { AppContext, useMarkdown } from "hooks";
import moment from "moment";
import { useContext } from "react";
import { IPost } from "types";

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
  const { theme, routerPush } = useContext(AppContext);
  const { title, slug, body, user, imageKey, updatedAt, hasMarkdown } = post;
  const date = moment(new Date(updatedAt)).format("DD/MM/YY");
  const markdown = useMarkdown(hasMarkdown, theme, body);

  return (
    <Card onClick={() => routerPush(`/${user?.username}/${slug}`)}>
      {imageKey && (
        <CardMedia>
          <motion.img
            src={`/api/images?key=${imageKey}`}
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
          <Row style={{ justifyContent: "flex-start" }}>
            {hasAuthorLink && <AuthorLink author={user} />}
            {hasDate && <p className="date">{date}</p>}
          </Row>
          {hasMarkdown ? (
            <div
              className="markdown-view card"
              dangerouslySetInnerHTML={{ __html: markdown }}
            />
          ) : (
            <p className={`body ${imageKey ? "short" : "long"}`}>{body}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
