import React, { useEffect, useState } from "react";
import { Column, HomePage, StyledText } from "../../components";
import { DBService, PageTitle } from "../../enums";
import { useIsoEffect } from "../../hooks";
import { HTTPService } from "../../lib/client";
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
    .populate("user", "-createdAt -email -password")
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
  const { user: author, ...stalePost } = post;
  const [realtimePost, setRealtimePost] = useState(post);

  useIsoEffect(() => {
    HTTPService.makeGetReq(DBService.POSTS, { username, slug }).then((res) => {
      if (res.status === 200 && res.data?.post?._id) {
        const updatedPost = { ...res.data.post, user: author } as IPost;
        setRealtimePost(updatedPost);
      }
    });
  }, [username, slug]);

  const { user, title, body } = realtimePost;
  const markup = (
    <Column>
      <div className="header">
        <h3>{title}</h3>
        <h4>{`By ${user?.username}`}</h4>
      </div>
      <div className="body-container">
        <p>{body}</p>
      </div>
    </Column>
  );

  return <HomePage title={PageTitle.POST} markup={markup} mainClass="left" />;
};

export default Post;
