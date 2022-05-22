import { motion } from "framer-motion";
import React, { useState } from "react";
import { Column, PostBanner } from "../../components";
import { DBService } from "../../enums";
import { useIsoEffect } from "../../hooks";
import { HTTPService, serverUrl } from "../../lib/client";
import { mongoConnection } from "../../lib/server";
import { IPost } from "../../types";
import { docToObject } from "../../util";

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
    .lean()
    .exec();

  return {
    props: {
      username,
      slug,
      post: docToObject(post),
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
  const [realtimePost, setRealtimePost] = useState(post);

  useIsoEffect(() => {
    HTTPService.makeGetReq(DBService.POSTS, { username, slug }).then((res) => {
      if (res.status === 200 && res.data?.post?._id) {
        const updatedPost = { ...res.data.post, user: author } as IPost;
        setRealtimePost(updatedPost);
      }
    });
  }, [username, slug]);

  const { user, title, body, imageKey, id } = realtimePost;
  return (
    <main className="left">
      <Column style={{ alignItems: "flex-start" }}>
        {imageKey && (
          <PostBanner
            src={`${serverUrl}/api/images?key=${imageKey}`}
            id={`${id}-banner`}
          />
        )}
        <div className="header">
          <motion.h3 layoutId={`${id}-title`}>{title}</motion.h3>
          <h4>{`By ${user?.username}`}</h4>
        </div>
        <div className="body-container">
          <p>{body}</p>
        </div>
      </Column>
    </main>
  );
};

export default Post;
