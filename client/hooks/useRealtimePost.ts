import { authHttpService, commonHttpService } from "lib/client";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { IPost } from "types";
import { processPost } from "utils";
import useIsoEffect from "./useIsoEffect";
import { DbService, HttpRequest, ToastMessage } from "enums";
import { useRouter } from "next/router";

const useRealtimePost = (
  post: IPost,
  byCurrUser = false,
  fresh = false,
  disabled = false
) => {
  const { id, username, slug } = post;
  const [realtimePost, setRealtimePost] = useState(post);
  const [isLoading, setIsLoading] = useState(!disabled);
  const isFetching = useRef(false);
  const router = useRouter();

  function fetchPost(): Promise<IPost> {
    const reqTime = new Date().valueOf(); // prevent loading disk cached
    const params = { id, username, slug, fresh, reqTime };
    return (
      byCurrUser
        ? authHttpService.makeAuthHttpReq(
            DbService.POST,
            HttpRequest.GET,
            params
          )
        : commonHttpService.get("post", { params })
    ).then((res) => {
      // server responds 200 with error: true when the post is not found
      if (res.data?.error) throw new Error(res.data.message);
      return processPost(res.data?.post);
    });
  }

  function refreshPost() {
    if (!isFetching.current) {
      isFetching.current = true;
      setIsLoading(true);
      fetchPost()
        .then(setRealtimePost)
        .catch((err) => {
          console.error(err);
          if (err?.response?.status === 401) {
            router.push("/401");
          } else {
            const message = err?.response
              ? err.response.data?.message
              : err?.message;
            toast.error(message || ToastMessage.POST_FETCH_FAILED);
          }
        })
        .finally(() => {
          isFetching.current = false;
          setIsLoading(false);
        });
    }
  }

  useIsoEffect(() => {
    if (disabled) return;

    if (byCurrUser) {
      if (id || (username && slug)) refreshPost();
      else {
        setRealtimePost(null);
        setIsLoading(false);
      }
    } else if ((username && slug) || (id && id !== "new")) {
      refreshPost();
    } else {
      setRealtimePost(null);
      setIsLoading(false);
    }
  }, [id, username, slug]);

  return { realtimePost, isLoading, refreshPost };
};

export default useRealtimePost;
