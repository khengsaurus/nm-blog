import { ClientHttpService } from "lib/client";
import { useCallback, useRef, useState } from "react";
import { IPost } from "types";
import { processPost } from "utils";
import useIsoEffect from "./useIsoEffect";

const useRealtimePost = (post: IPost, fresh = false) => {
  const [realtimePost, setRealtimePost] = useState(post);
  const isFetching = useRef(false);

  const fetchPost = useCallback(
    (): Promise<IPost> => {
      return new Promise((resolve) => {
        const { id, slug, username } = post;
        const reqTime = new Date().valueOf(); // prevent loading disk cached
        const params = { id, slug, username, fresh, reqTime };
        new ClientHttpService()
          .get("post", { params })
          .then((res) => resolve(processPost(res.data?.post)))
          .catch((err) => {
            console.error(err);
            resolve(post);
          });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.id, fresh]
  );

  const refreshPost = useCallback(async () => {
    if (!isFetching.current) {
      isFetching.current = true;
      await fetchPost().then((post) => {
        isFetching.current = false;
        setRealtimePost(post);
      });
    }
  }, [fetchPost]);

  useIsoEffect(() => {
    if (!post?.id || post.id == "new") setRealtimePost(null);
    else refreshPost();
  }, []);

  return { realtimePost, refreshPost };
};

export default useRealtimePost;
