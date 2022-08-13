import { Card, CardContent, CardMedia } from "@mui/material";
import { AuthorLink, Row } from "components";
import { Dimension, Flag } from "enums";
import { motion } from "framer-motion";
import { AppContext, useDynamicSrc, useMarkdown } from "hooks";
import moment from "moment";
import { useCallback, useContext } from "react";
import { IPost } from "types";
import { getCardSrc, getBannerSrc } from "utils";

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
  const { title, slug, body, username, imageKey, createdAt, hasMarkdown } =
    post;
  const markdown = useMarkdown(hasMarkdown, theme?.name, body);
  const date = moment(new Date(createdAt)).format("DD/MM/YY");
  const hasRealImage = !!imageKey && imageKey !== Flag.PREVIEW_IMG;
  const hasImage = showingPreview || hasRealImage;
  const readySrc = useDynamicSrc(getCardSrc(imageKey), getBannerSrc(imageKey));

  const handleClick = useCallback(() => {
    disable ? null : routerPush(`/${username}/${slug}`);
  }, [disable, username, slug, routerPush]);

  return (
    <Card
      onClick={handleClick}
      style={disable ? { cursor: "default" } : null}
      sx={{ width: Dimension.CARD_W, margin: "6px" }}
    >
      {hasRealImage && (
        <CardMedia>
          <motion.img
            src={readySrc}
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
            {hasAuthorLink && (
              <AuthorLink username={username} disable={disable} />
            )}
            {hasDate && <p className="date">{date}</p>}
          </Row>
          {hasMarkdown ? (
            <div
              className="markdown-view card"
              dangerouslySetInnerHTML={{ __html: markdown }}
              onClick={(e) => e.preventDefault()}
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
