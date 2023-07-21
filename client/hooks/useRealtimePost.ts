import { authHttpService, commonHttpService } from "lib/client";
import { useRef, useState } from "react";
import { IPost } from "types";
import { processPost } from "utils";
import useIsoEffect from "./useIsoEffect";
import { DbService, HttpRequest } from "enums";
import { useRouter } from "next/router";

const useRealtimePost = (
  post: IPost,
  byCurrUser = false,
  fresh = false,
  disabled = false
) => {
  const { id, username, slug } = post;
  const [realtimePost, setRealtimePost] = useState(post);
  const isFetching = useRef(false);
  const router = useRouter();

  function fetchPost(): Promise<IPost> {
    return new Promise((resolve) => {
      const reqTime = new Date().valueOf(); // prevent loading disk cached
      const params = { id, username, slug, fresh, reqTime };
      (byCurrUser
        ? authHttpService.makeAuthHttpReq(
            DbService.POST,
            HttpRequest.GET,
            params
          )
        : commonHttpService.get("post", { params })
      )
        .then((res) => resolve(processPost(res.data?.post)))
        .catch((err) => {
          console.error(err);
          if (err?.response?.status === 401) router.push("/401");
          else resolve(post);
        });
    });
  }

  function refreshPost() {
    if (!isFetching.current) {
      isFetching.current = true;
      fetchPost().then((post) => {
        isFetching.current = false;
        setRealtimePost(post);
      });
    }
  }

  useIsoEffect(() => {
    if (disabled) return;

    if (byCurrUser) {
      if (id || (username && slug)) refreshPost();
      else setRealtimePost(null);
    } else if ((username && slug) || (id && id !== "new")) {
      refreshPost();
    } else {
      setRealtimePost(null);
    }
  }, [id, username, slug]);

  return { realtimePost, refreshPost };
};

export default useRealtimePost;
