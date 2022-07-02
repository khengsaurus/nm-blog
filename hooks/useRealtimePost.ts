import { DBService, ErrorMessage } from "enums";
import { HTTPService } from "lib/client";
import { useCallback, useRef, useState } from "react";
import { IPost, IUser } from "types";
import { processPostWithUser } from "utils";
import useIsoEffect from "./useIsoEffect";

const useRealtimePost = (post: IPost) => {
  const [realtimePost, setRealtimePost] = useState(post);
  const { id: postId, username, user: author } = post || {};
  const isFetching = useRef(false);

  const fetchAuthor = useCallback((): Promise<IUser> => {
    return new Promise((resolve) => {
      HTTPService.makeGetReq(DBService.USERS, { id: author?.id, username })
        .then((res) => resolve(res?.data?.user))
        .catch((err) => {
          console.info(err);
          resolve(author);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author?.id, username]);

  const fetchPost = useCallback((): Promise<IPost> => {
    return new Promise((resolve) => {
      const { id, slug, username } = post;
      HTTPService.makeGetReq(DBService.POSTS, { id, slug, username })
        .then((res) => {
          if (res.status === 200 && res.data?.post) {
            const updatedPost = processPostWithUser(res.data?.post) as IPost;
            resolve(updatedPost);
          } else throw new Error(ErrorMessage.P_RETRIEVE_FAIL);
        })
        .catch((err) => {
          console.info(err);
          resolve(post);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const refreshPost = useCallback(async () => {
    if (!isFetching.current) {
      isFetching.current = true;
      await Promise.all([fetchAuthor(), fetchPost()]).then(
        ([_author, _post]) => {
          isFetching.current = false;
          _post.user = _author;
          setRealtimePost(_post);
        }
      );
    }
  }, [fetchAuthor, fetchPost]);

  useIsoEffect(() => {
    if (postId == "new") setRealtimePost(null);
    else refreshPost();
  }, []);

  return { realtimePost, refreshPost };
};

export default useRealtimePost;
