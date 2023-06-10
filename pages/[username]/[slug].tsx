import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Fab } from "@mui/material";
import Container from "@mui/system/Container";
import axios from "axios";
import {
  AuthorLink,
  DarkContainer,
  DarkText,
  DeletePostModal,
  Files,
  PostBanner,
  Row,
  StyledText,
} from "components";
import { IS_DEV, SERVER_URL } from "consts";
import { PageRoute } from "enums";
import {
  AppContext,
  useMarkdown,
  useNavShortcuts,
  usePageReady,
  useRealtimePost,
} from "hooks";
import moment from "moment";
import { GetStaticPropsResult } from "next";
import FourOFour from "pages/404";
import { useContext, useMemo, useState } from "react";
import { IPost } from "types";
import { getAvatarMedium, processPost } from "utils";

interface IPostPage {
  post: IPost;
  username: string;
  slug: string;
}

export async function getStaticPaths() {
  const paths = await axios
    .get(`${SERVER_URL}/posts/recent`)
    .then((res) => {
      const { message, paths, error } = res?.data;
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

  const post = await axios
    .get(`${SERVER_URL}/post`, { params })
    .then((res) => {
      const { message, post, error } = res?.data;
      if (error) throw new Error(message);
      const _post = processPost(post);
      return _post;
    })
    .catch((err) => {
      console.error(
        `Error in [${username}]/[${slug}] getStaticProps: ${err?.message}`
      );
      return {};
    });

  return {
    props: { username, slug, post },
    revalidate: 60,
  };
}

const Post = ({ post, slug, username }: IPostPage) => {
  const { theme, user: currUser, routerPush } = useContext(AppContext);
  const [showDelete, setShowDelete] = useState(false);
  const { realtimePost } = useRealtimePost(post || { username, slug });
  const {
    id,
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

  function handleEdit() {
    routerPush(`${PageRoute.POST_FORM}/${id}`);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDelete(true);
  }

  const enableEdit = IS_DEV || currUser?.id === author?.id;

  return realtimePost?.id ? (
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
      {realtimePost?.hasMarkdown ? (
        <Container
          className="markdown-view"
          dangerouslySetInnerHTML={{ __html: markdown }}
        />
      ) : (
        <section className="post-body">
          <StyledText text={body} variant="body1" paragraph />
        </section>
      )}
      <Files files={realtimePost?.files} disableDelete />
      {enableEdit && (
        <div className="edit-container">
          <Fab className="edit-button" onClick={handleEdit} disableRipple>
            <EditIcon style={{ width: 40, height: 40 }} />
          </Fab>
          <Fab
            className="delete-button"
            onClick={handleDeleteClick}
            disableRipple
          >
            <DeleteIcon style={{ width: 25, height: 25 }} />
          </Fab>
        </div>
      )}
      <DeletePostModal
        post={realtimePost}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
      />
    </main>
  ) : (
    <FourOFour />
  );
};

export default Post;
