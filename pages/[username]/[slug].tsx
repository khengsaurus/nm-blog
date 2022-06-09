import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import Container from "@mui/system/Container";
import {
  AuthorLink,
  DarkContainer,
  DeletePostModal,
  PostBanner,
  StyledText,
} from "components";
import { PageRoute } from "enums";
import { AppContext, useRealtimePost } from "hooks";
import { mongoConnection } from "lib/server";
import { useContext, useState } from "react";
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
    revalidate: 2 * 60 * 60 * 1000, // ms
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
  const { user: author, id } = post;
  const { user, routerPush } = useContext(AppContext);
  const { realtimePost } = useRealtimePost(post);

  const { title, body, imageKey } = realtimePost;

  function handleEdit() {
    routerPush(`${PageRoute.POST_FORM}/${id}`);
  }

  const [showDelete, setShowDelete] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDelete(true);
  }

  return (
    <>
      <main className="left">
        {imageKey && (
          <PostBanner src={`/api/images?key=${imageKey}`} id={`${imageKey}`} />
        )}
        <section className="header">
          <DarkContainer>
            <StyledText text={title} variant="h2" />
          </DarkContainer>
          <DarkContainer>
            <AuthorLink author={author} title />
          </DarkContainer>
        </section>
        <section className="post-body">
          <StyledText text={body} variant="body1" />
        </section>
      </main>
      {user?.id === author?.id && (
        <div className="post-edit-container">
          <Container className="post-edit-button">
            <IconButton disableRipple onClick={handleEdit}>
              <EditIcon style={{ width: 40, height: 40 }} color="primary" />
            </IconButton>
          </Container>
          <Container className="post-delete-button">
            <IconButton disableRipple onClick={handleDeleteClick}>
              <DeleteIcon style={{ width: 25, height: 25 }} color="primary" />
            </IconButton>
          </Container>
        </div>
      )}
      <DeletePostModal
        post={realtimePost}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
      />
    </>
  );
};

export default Post;
