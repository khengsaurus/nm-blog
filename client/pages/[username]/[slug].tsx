import { Avatar } from "@mui/material";
import Container from "@mui/system/Container";
import {
  AuthorLink,
  DarkContainer,
  DarkText,
  Files,
  PostBanner,
  Row,
  StyledText,
} from "components";
import {
  AppContext,
  useMarkdown,
  useNavShortcuts,
  usePageReady,
  useRealtimePost,
} from "hooks";
import { commonHttpService } from "lib/client";
import moment from "moment";
import { GetStaticPropsResult } from "next";
import FourOFour from "pages/404";
import { useContext, useMemo } from "react";
import { IPost } from "types";
import { getAvatarMedium, processPost } from "utils";
import FourOOne from "../401";

interface IPostPage {
  post: IPost;
  username: string;
  slug: string;
  status?: number;
}

export async function getStaticPaths() {
  const paths = await commonHttpService
    .get("posts/recent")
    .then((res) => {
      const { message, paths, error } = res?.data || {};
      if (error) throw new Error(message);
      return paths;
    })
    .catch((err) => {
      console.error(`Error in [slug] getStaticPaths: ${err?.message}`);
      return [];
    });

  return {
    paths,
    fallback: "blocking", // fall back to SSR
  };
}

export async function getStaticProps({
  params,
}): Promise<GetStaticPropsResult<IPostPage>> {
  const { username, slug } = params;
  let status = 200;

  const post = await commonHttpService
    .get("post", { params })
    .then((res) => {
      const { message, post, error } = res?.data || {};
      if (error) throw new Error(message);
      const _post = processPost(post);
      return _post;
    })
    .catch((err) => {
      status = err?.response?.status || 500;
      console.error(
        `Error in [${username}]/[${slug}] getStaticProps: ${err?.message}`
      );
      return {};
    });

  return {
    props: { username, slug, post, status },
    revalidate: 60,
  };
}

const Post = ({ username, slug, post, status }: IPostPage) => {
  const { theme } = useContext(AppContext);
  const { realtimePost } = useRealtimePost(
    post || { username, slug },
    false,
    false,
    status === 401
  );
  const {
    title,
    body,
    imageKey,
    user: author,
    updatedAt,
    createdAt,
    hasMarkdown,
  } = realtimePost || {};
  const markdown = useMarkdown(hasMarkdown, theme?.name, body);
  useNavShortcuts();
  usePageReady();

  const dateText = useMemo(() => {
    if (createdAt === updatedAt) {
      return `Posted on ${moment(new Date(createdAt)).format("DD/MM/YY")}`;
    } else {
      return `Updated on ${moment(new Date(updatedAt)).format("DD/MM/YY")}`;
    }
  }, [createdAt, updatedAt]);

  if (status === 401) return <FourOOne />;

  return realtimePost ? (
    <main className="left">
      {imageKey && <PostBanner imageKey={imageKey} />}
      <section className={`header column ${imageKey ? "pad-top" : ""}`}>
        <DarkText text={title} variant="h2" />
        <Row style={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
          <DarkContainer>
            <AuthorLink username={username} title />
          </DarkContainer>
          {author?.avatarKey && (
            <Avatar
              alt={`${author?.username}-avatar`}
              src={getAvatarMedium(author.avatarKey)}
              sx={{ height: "40px", width: "40px", marginLeft: "10px" }}
            />
          )}
        </Row>
        <DarkText text={dateText} variant="h4" />
      </section>
      {realtimePost.hasMarkdown ? (
        <Container
          className="markdown-view"
          dangerouslySetInnerHTML={{ __html: markdown }}
        />
      ) : (
        <section className="post-body">
          <StyledText text={body} variant="body1" paragraph />
        </section>
      )}
      <Files files={realtimePost.files} disableDelete />
    </main>
  ) : (
    <FourOFour />
  );
};

export default Post;
