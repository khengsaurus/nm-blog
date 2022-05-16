import React, { useEffect, useState } from "react";
import { HomePage } from "../../components";
import { PageTitle } from "../../enums";
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
  const { username, slug } = params;
  const { Post } = await mongoConnection();
  const post = await Post.findOne({ username, slug })
    .populate("user", "-createdAt -email -password")
    .lean()
    .exec();

  return {
    props: { post: docToObject(post), username, slug },
    revalidate: 2 * 60 * 60 * 1000, // ms
  };
}

export async function getStaticPaths() {
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
  const [realtimePost, setRealtimePost] = useState(post);

  useEffect(() => {
    HTTPService.getPost(username, slug).then((_post) => {
      console.log("Post retrieved: ");
      console.log(_post);
      setRealtimePost(_post as IPost);
    });
  }, [username, slug]);

  const { user, title, body } = realtimePost;
  const markup = <div>{title}</div>;

  return <HomePage title={PageTitle.POST} markup={markup} />;
};

export default Post;
