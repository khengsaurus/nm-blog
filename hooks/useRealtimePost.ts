import { DBService, ErrorMessage } from "enums";
import { HTTPService } from "lib/client";
import { useCallback, useContext, useRef, useState } from "react";
import { IPost, IUser } from "types";
import { processPostWithUser } from "utils";
import { AppContext } from "./context";
import useIsoEffect from "./useIsoEffect";

const useRealtimePost = (post: IPost, fresh = false) => {
  const { id: postId, username, user: author } = post || {};
  const [realtimePost, setRealtimePost] = useState(post);
  const { getFromQueryCache, setToQueryCache } = useContext(AppContext);
  const isFetching = useRef(false);

  const fetchAuthor = useCallback((): Promise<IUser> => {
    return new Promise((resolve) => {
      if (!author?.id) resolve(null);

      const authorKey = `user-${author.id}`;
      const cachedAuthor = getFromQueryCache(authorKey);
      if (cachedAuthor) return resolve(cachedAuthor);

      HTTPService.makeGetReq(DBService.USERS, {
        id: author.id,
        username,
      })
        .then((res) => {
          const user = res?.data?.user;
          if (user?.id) setToQueryCache(authorKey, user);
          resolve(user);
        })
        .catch((err) => {
          console.info(err);
          resolve(author);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author?.id, username]);

  const fetchPost = useCallback(
    (): Promise<IPost> => {
      return new Promise((resolve) => {
        const { id, slug, username } = post;
        HTTPService.makeGetReq(DBService.POSTS, {
          id,
          slug,
          username,
          fresh,
        })
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post?.id, fresh]
  );

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
