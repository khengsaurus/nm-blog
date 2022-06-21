import { PAGINATE_LIMIT } from "consts";
import { DBService, ServerInfo } from "enums";
import { HTTPService } from "lib/client";
import { useCallback, useRef, useState } from "react";
import { IObject, IPost } from "types";
import useIsoEffect from "./useIsoEffect";

const usePaginatePosts = (
  ready: boolean,
  publicPosts: boolean,
  initPosts?: IPost[],
  username?: string,
  limit = PAGINATE_LIMIT
) => {
  const [posts, setPosts] = useState(initPosts || []);
  const [limitReached, setLimitReached] = useState(false);
  const latestUpdated = useRef(false);
  const isLoading = useRef(false);

  const loadMore = useCallback(async () => {
    if (!isLoading.current) {
      isLoading.current = true;
      const createdAt =
        latestUpdated.current && posts.length > 0
          ? posts[posts.length - 1].createdAt
          : undefined; // let server handle this + cache query

      const query: IObject<any> = { createdAt, limit, isPrivate: true };
      if (username) query.username = username;
      if (publicPosts) query.isPrivate = false;

      HTTPService.makeGetReq(DBService.POSTS, query).then((res) => {
        if (res.status === 200) {
          if (res.data?.posts?.length > 0) {
            const _posts = latestUpdated.current
              ? [...posts, ...res.data.posts]
              : res.data.posts;
            setPosts(_posts);
            latestUpdated.current = true;
          }
          if (
            res.data?.posts?.length < limit ||
            res.data?.message === ServerInfo.POST_NA
          ) {
            setLimitReached(true);
          }
        }
        isLoading.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts?.length, limit, username, setPosts]);

  useIsoEffect(() => {
    if (ready) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return { posts, limitReached, loadMore };
};

export default usePaginatePosts;
