import { PAGINATE_LIMIT } from "consts";
import { DBService, ServerInfo } from "enums";
import { HTTPService } from "lib/client";
import { MutableRefObject, useCallback, useRef, useState } from "react";
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
  const isLoading = useRef(false);
  const oldest = useRef("");

  const loadMoreFn = useCallback(
    async (dateRef: MutableRefObject<string>, existingPosts: IPost[]) => {
      if (!isLoading.current) {
        isLoading.current = true;

        const query: IObject<any> = {
          limit,
          isPrivate: true,
        };
        if (dateRef.current) query.createdAt = dateRef.current;
        if (username) query.username = username;
        if (publicPosts) query.isPrivate = false;

        HTTPService.makeGetReq(DBService.POSTS, query).then((res) => {
          const { posts: newPosts, message } = res?.data || {};
          if (res.status === 200) {
            if (newPosts?.length > 0) {
              const _posts = dateRef.current
                ? [...existingPosts, ...newPosts]
                : newPosts;
              let dateVal = newPosts[newPosts.length - 1].createdAt;
              dateVal = new Date(dateVal).valueOf();
              dateRef.current = dateVal;
              setPosts(_posts);
            }
            if (newPosts?.length < limit || message === ServerInfo.POST_NA) {
              setLimitReached(true);
            }
          }
          isLoading.current = false;
        });
      }
    },
    [limit, username, publicPosts]
  );

  useIsoEffect(() => {
    if (ready) loadMoreFn(oldest, posts);
  }, [ready, loadMoreFn]);

  const loadMore = () => loadMoreFn(oldest, posts);

  return { posts, limitReached, loadMore };
};

export default usePaginatePosts;
