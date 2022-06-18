import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Fab } from "@mui/material";
import Container from "@mui/system/Container";
import {
  AuthorLink,
  DarkContainer,
  DeletePostModal,
  PostBanner,
  Row,
  StyledText,
} from "components";
import { PageRoute } from "enums";
import { AppContext, useMarkdown, useRealtimePost } from "hooks";
import { mongoConnection } from "lib/server";
import moment from "moment";
import FourOFour from "pages/404";
import { useContext, useMemo, useState } from "react";
import { IPost } from "types";
import { postDocToObj } from "utils";

interface IPostPage {
  post: IPost;
  username: string;
  slug: string;
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const { Post } = await mongoConnection();
  const post = await Post.findOne({ username, slug })
    .populate("user", "-createdAt -email -password -posts")
    .lean();

  return {
    props: {
      username,
      slug,
      post: postDocToObj(post),
    },
    revalidate: 60 * 1000,
  };
}

export async function getStaticPaths() {
  const { Post } = await mongoConnection();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
    .exec();
  const paths =
    posts.map((post) => {
      const { username, slug } = post;
      return {
        params: { username, slug },
      };
    }) || [];

  return {
    paths,
    fallback: "blocking", // fall back to SSR
  };
}

const Post = ({ post }: IPostPage) => {
  const { user: author, id } = post || {};
  const { theme, user, routerPush } = useContext(AppContext);
  const [showDelete, setShowDelete] = useState(false);
  const { realtimePost } = useRealtimePost(post);
  const { title, body, hasMarkdown, imageKey, updatedAt, createdAt } =
    realtimePost || {};
  const markdown = useMarkdown(hasMarkdown, theme, body);

  const dateText = useMemo(() => {
    if (createdAt === updatedAt) {
      return moment(new Date(createdAt)).format("DD/MM/YY");
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

  return realtimePost ? (
    <>
      <main className="left">
        {imageKey && (
          <PostBanner
            src={`${process.env.ENV_AWS_S3_SRC}${imageKey}`}
            id={`${imageKey}`}
          />
        )}
        <section className="header column">
          <DarkContainer>
            <StyledText text={title} variant="h2" />
          </DarkContainer>
          <Row style={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
            <DarkContainer>
              <AuthorLink author={author} title />
            </DarkContainer>
            <Avatar
              alt={`${author?.username}-avatar`}
              src={`${process.env.ENV_AWS_S3_SRC}${author?.avatarKey}`}
              sx={{ height: "40px", width: "40px", marginLeft: "10px" }}
            />
          </Row>
          <DarkContainer>
            <StyledText text={dateText} variant="h4" />
          </DarkContainer>
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
      </main>
      {user?.id === author?.id && (
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
    </>
  ) : (
    <FourOFour />
  );
};

export default Post;
