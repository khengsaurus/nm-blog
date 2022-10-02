/* eslint-disable @next/next/no-img-element */
import { Card, CardContent, CardMedia } from "@mui/material";
import { AuthorLink, Row } from "components";
import { Dimension, Flag } from "enums";
import { AppContext, useMarkdown } from "hooks";
import moment from "moment";
import { useContext } from "react";
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
  height: `${Dimension.CARD_IMG_H}px`,
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

  const handleClick = () => {
    if (disable) return;
    routerPush(`/${username}/${slug}`);
  };

  return (
    <Card
      onClick={handleClick}
      style={disable ? { cursor: "default" } : null}
      sx={{ width: Dimension.CARD_W, margin: "6px" }}
    >
      {hasRealImage && (
        <CardMedia>
          <img
            src={getCardSrc(imageKey)}
            alt="card-image"
            style={imgStyle}
            id={imageKey}
          />
        </CardMedia>
      )}
      {imageKey === Flag.PREVIEW_IMG && (
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
