import { Card, CardContent, CardMedia } from "@mui/material";
import { AuthorLink, Row } from "components";
import { motion } from "framer-motion";
import { AppContext, useMarkdown, useWindowDimensions } from "hooks";
import moment from "moment";
import Head from "next/head";
import { useContext } from "react";
import { IPost } from "types";
import { getBannerSrc, getCardSrc } from "utils";

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
  const { width } = useWindowDimensions();
  const markdown = useMarkdown(hasMarkdown, theme, body);
  const date = moment(new Date(updatedAt)).format("DD/MM/YY");

  return (
    <Card onClick={() => routerPush(`/${user?.username}/${slug}`)}>
      <Head>
        {imageKey && width && (
          <link
            rel="prefetch"
            href={getBannerSrc(imageKey, width)}
            as="image"
          />
        )}
      </Head>
      {imageKey && (
        <CardMedia>
          <motion.img
            src={getCardSrc(imageKey)}
            alt="post-image"
            layoutId={`banner-${imageKey}${postTag}`}
            style={{
              height: "80px",
              width: "100%",
              objectFit: "cover",
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
        <div className={`card-content ${imageKey ? "has-image" : ""}`}>
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
