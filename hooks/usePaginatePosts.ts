import { DBService } from "enums";
import { HTTPService } from "lib/client";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { IPost } from "types";

const usePaginatePosts = (
  ready: boolean,
  publicPosts: boolean,
  initPosts?: IPost[],
  username?: string,
  limit = 2
) => {
  const [posts, setPosts] = useState(initPosts || []);

  const loadMore = useCallback(async () => {
    const createdAt =
      posts.length === 0 ? new Date() : posts[posts.length - 1].createdAt;
    const query: any = { createdAt, limit };
    if (username) query.username = username;
    if (publicPosts) query.isPrivate = false;
    HTTPService.makeGetReq(DBService.POSTS, query).then((res) => {
      if (res.status === 200 && res.data?.posts?.length > 0) {
        const _posts = [...posts, ...res.data.posts];
        setPosts(_posts);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts?.length, limit, username, setPosts]);

  useEffect(() => {
    if (ready && isEmpty(initPosts)) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return { posts, loadMore };
};

export default usePaginatePosts;
