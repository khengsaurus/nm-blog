import { PAGINATE_LIMIT } from "consts";
import { DbService, HttpRequest, ServerInfo, Status } from "enums";
import { authHttpService, commonHttpService } from "lib/client";
import debounce from "lodash/debounce";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { IPost } from "types";

const usePaginatePosts = (
  ready: boolean,
  publicPosts: boolean,
  initPosts?: IPost[],
  username?: string,
  searchStr?: string,
  limit = PAGINATE_LIMIT
) => {
  const [posts, setPosts] = useState(initPosts || []);
  const [limitReached, setLimitReached] = useState(false);
  const [status, setStatus] = useState(Status.IDLE);
  const [search, setSearch] = useState("");
  const oldestCrA = useRef("");
  const prevSearch = useRef("");
  const abortControllerRef = useRef<AbortController>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearchStr = useCallback(
    debounce((str: string) => {
      if (str?.trim() !== prevSearch.current?.trim()) {
        setSearch(str || "");
      }
    }, 1000),
    []
  );

  useEffect(() => debounceSearchStr(searchStr), [debounceSearchStr, searchStr]);

  const abortPendingReq = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = null;
  };

  const loadMoreCb = useCallback(
    async (dateRef: MutableRefObject<string>) => {
      if (!publicPosts && !username) return;
      abortPendingReq();
      setStatus(Status.PENDING);
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      let isNewQuery = false;
      if (search?.trim() !== prevSearch.current?.trim()) {
        isNewQuery = true;
        dateRef.current = "";
        prevSearch.current = search || "";
      }

      const query: Record<string, any> = {
        limit,
        isPrivate: true,
      };
      if (!isNewQuery && dateRef.current) query.createdAt = dateRef.current;
      if (username) query.username = username;
      if (publicPosts) query.isPrivate = false;
      if (search) query.search = search;

      (publicPosts
        ? commonHttpService.get("posts", {
            params: query,
            signal: newAbortController.signal,
          })
        : authHttpService.makeAuthHttpReq(
            DbService.POSTS,
            HttpRequest.GET,
            query,
            { signal: newAbortController.signal }
          )
      ).then((res) => {
        abortControllerRef.current = null;
        const { posts: newPosts, message } = res?.data || {};
        if (res.status === 200) {
          if (newPosts?.length) {
            // If first pull, set as posts, else append to posts
            const _posts =
              isNewQuery || !dateRef.current
                ? newPosts
                : [...posts, ...newPosts];
            let dateVal = newPosts[newPosts.length - 1].createdAt;
            dateVal = new Date(dateVal).valueOf();
            dateRef.current = dateVal;
            setPosts(_posts);
          }
          if (newPosts?.length < limit) {
            if (message === ServerInfo.POST_NA && isNewQuery) {
              toast.error("No posts found");
            } else {
              toast.success("You've reached the end");
            }
            setLimitReached(true);
          } else {
            setLimitReached(false);
          }
        }
        setStatus(Status.IDLE);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, username, publicPosts, search, posts?.length]
  );

  useEffect(() => {
    if (ready) {
      abortPendingReq();
      loadMoreCb(oldestCrA);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, search]);

  const loadMore = () => loadMoreCb(oldestCrA);

  return { posts, limitReached, status, loadMore };
};

export default usePaginatePosts;
