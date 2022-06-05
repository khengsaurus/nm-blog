import { DBService } from "enums";
import { HTTPService } from "lib/client";
import { useCallback, useState } from "react";
import { IPost } from "types";
import { postDocToObj } from "utils";
import useIsoEffect from "./useIsoEffect";

const useRealtimePost = (post: IPost) => {
  const { id, slug, username, user } = post;
  const [realtimePost, setRealtimePost] = useState(post);

  const refreshPost = useCallback(() => {
    HTTPService.makeGetReq(DBService.POSTS, { id, slug, username }).then(
      (res) => {
        if (res.status === 200 && res.data?.post?._id) {
          const updatedPost = {
            ...postDocToObj(res.data.post),
            user,
          } as IPost;
          setRealtimePost(updatedPost);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug, username]);

  useIsoEffect(() => {
    if (id == "new") {
      setRealtimePost(null);
    } else {
      refreshPost();
    }
  }, [id, refreshPost]);

  return { realtimePost, refreshPost };
};

export default useRealtimePost;
