import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Fab } from "@mui/material";
import Container from "@mui/system/Container";
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
import { getAvatarMedium } from "utils";

interface MyPostPage {
  slug: string;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking", // fall back to SSR
  };
}

export async function getStaticProps({
  params,
}): Promise<GetStaticPropsResult<MyPostPage>> {
  return { props: { slug: params.slug } };
}

const MyPost = ({ slug }: MyPostPage) => {
  const { theme, user: currUser, routerPush } = useContext(AppContext);
  const [showDelete, setShowDelete] = useState(false);
  const { realtimePost } = useRealtimePost(
    { username: currUser?.username, slug },
    true,
    true
  );

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
      return `Posted on ${
        createdAt ? moment(new Date(createdAt)).format("DD/MM/YY") : "-"
      }`;
    } else {
      return `Updated on ${
        updatedAt ? moment(new Date(updatedAt)).format("DD/MM/YY") : "-"
      }`;
    }
  }, [createdAt, updatedAt]);

  function handleEdit() {
    routerPush(`${PageRoute.POST_FORM}/${id}`);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDelete(true);
  }

  return realtimePost ? (
    <main className="left">
      {imageKey && <PostBanner imageKey={imageKey} />}
      <section className={`header column ${imageKey ? "pad-top" : ""}`}>
        <DarkText text={title || slug} variant="h2" />
        <Row style={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
          <DarkContainer>
            <AuthorLink title byCurrUser />
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
      <DeletePostModal
        post={realtimePost}
        showDelete={showDelete}
        close={() => setShowDelete(false)}
      />
    </main>
  ) : (
    <FourOFour />
  );
};

export default MyPost;
