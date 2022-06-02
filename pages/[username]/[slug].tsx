import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import React, { useContext, useState } from "react";
import { AuthorLink, PostBanner, StyledText } from "../../components";
import { DBService } from "../../enums";
import { AppContext, useIsoEffect } from "../../hooks";
import { HTTPService, serverUrl } from "../../lib/client";
import { mongoConnection } from "../../lib/server";
import { IPost } from "../../types";
import { postDocToObj } from "../../utils";

interface IPostPage {
  post: IPost;
  username: string;
  slug: string;
}

export async function getStaticProps({ params }) {
  console.info("-> [username][slug] getStaticProps()");
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
  console.info("-> [username][slug] getStaticPaths()");
  const { Post } = await mongoConnection();
  const posts = await Post.find().limit(100);
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

const Post = ({ post, username, slug }: IPostPage) => {
  const { user: author } = post;
  const { user } = useContext(AppContext);
  const [realtimePost, setRealtimePost] = useState(post);

  useIsoEffect(() => {
    HTTPService.makeGetReq(DBService.POSTS, { username, slug }).then((res) => {
      if (res.status === 200 && res.data?.post?._id) {
        const updatedPost = { ...res.data.post, user: author } as IPost;
        setRealtimePost(updatedPost);
      }
    });
  }, [username, slug]);

  const { title, body, imageKey } = realtimePost;

  return (
    <>
      <main className="left">
        {imageKey && (
          <PostBanner
            src={`${serverUrl}/api/images?key=${imageKey}`}
            id={`${imageKey}`}
          />
        )}
        <section className="header">
          <StyledText text={title} variant="h2" />
          <AuthorLink author={user} title />
        </section>
        <section className="post-body">
          <StyledText text={body} variant="body1" />
        </section>
      </main>
      {user?.id === author?.id && (
        <div className="post-edit-container">
          <div className="post-edit-button">
            <IconButton disableRipple>
              <EditIcon style={{ width: 40, height: 40 }} color="primary" />
            </IconButton>
          </div>
          <div className="post-delete-button">
            <IconButton disableRipple>
              <DeleteIcon style={{ width: 25, height: 25 }} color="primary" />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
