import { Card, CardContent, CardMedia } from "@mui/material";
import { AuthorLink, Row } from "components";
import { Flag } from "enums";
import { motion } from "framer-motion";
import { AppContext, useMarkdown } from "hooks";
import moment from "moment";
import { useCallback, useContext } from "react";
import { IPost } from "types";
import { getCardSrc } from "utils";

interface IPostCard {
  post: IPost;
  hasDate?: boolean;
  hasAuthorLink?: boolean;
  disable?: boolean;
  showingPreview?: boolean;
}

const imgStyle: any = {
  height: "80px",
  width: "100%",
  objectFit: "cover",
};

const PostCard = ({
  post,
  hasDate = true,
  hasAuthorLink = true,
  disable = false,
  showingPreview = false,
}: IPostCard) => {
  const { theme, routerPush } = useContext(AppContext);
  const { title, slug, body, user, imageKey, updatedAt, hasMarkdown } = post;
  const markdown = useMarkdown(hasMarkdown, theme?.name, body);
  const date = moment(new Date(updatedAt)).format("DD/MM/YY");
  const hasRealImage = !!imageKey && imageKey !== Flag.PREVIEW_IMG;
  const hasImage = showingPreview || hasRealImage;

  const handleClick = useCallback(() => {
    disable ? null : routerPush(`/${user?.username}/${slug}`);
  }, [disable, user?.username, slug, routerPush]);

  return (
    <Card
      onClick={handleClick}
      style={disable ? { cursor: "default" } : null}
      sx={{ width: "280px", margin: "6px" }}
    >
      {hasRealImage && (
        <CardMedia>
          <motion.img
            src={getCardSrc(imageKey)}
            alt="card-image"
            layoutId={`banner-${imageKey}`}
            style={imgStyle}
          />
        </CardMedia>
      )}
      {imageKey === Flag.PREVIEW_IMG && ( // eslint-disable-next-line @next/next/no-img-element
        <img
          src=""
          alt={Flag.PREVIEW_IMG}
          id={Flag.PREVIEW_IMG}
          style={{ ...imgStyle, display: "none" }}
        />
      )}
      <CardContent
        style={{
          height: hasImage ? 105 : 185,
          borderTop: hasImage ? "none" : null,
        }}
      >
        <div className={`card-content ${hasImage ? "has-image" : ""}`}>
          <h6>{title}</h6>
          <Row style={{ justifyContent: "flex-start" }}>
            {hasAuthorLink && <AuthorLink author={user} disable={disable} />}
            {hasDate && <p className="date">{date}</p>}
          </Row>
          {hasMarkdown ? (
            <div
              className="markdown-view card"
              dangerouslySetInnerHTML={{ __html: markdown }}
            />
          ) : (
            <p className={`body ${hasImage ? "short" : "long"}`}>{body}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
