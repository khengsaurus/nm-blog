import { DBService } from "enums";
import { HTTPService } from "lib/client";
import { useState } from "react";
import { IPost } from "types";
import { postDocToObj } from "utils";
import useIsoEffect from "./useIsoEffect";

const useRealtimePost = (post: Partial<IPost>) => {
  const { id, slug, username, user } = post;
  const [realtimePost, setRealtimePost] = useState(post);

  useIsoEffect(() => {
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
  }, [username, slug]);

  return realtimePost;
};

export default useRealtimePost;
