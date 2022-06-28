import {
  CircleLoader,
  DarkText,
  PostCard,
  PostFeedDiv,
  StyledButton,
  WindowLoaded,
} from "components";
import { PAGINATE_LIMIT } from "consts";
import { Dimension, Status } from "enums";
import { usePaginatePosts, useWindowLoaded } from "hooks";
import { CSSProperties } from "react";
import { IPost } from "types";

interface IPostFeed {
  hasAuthorLink?: boolean;
  hasDate?: boolean;
  initPosts?: IPost[];
  limitPosts?: number;
  paginateLimit?: number;
  publicPosts?: boolean;
  ready?: boolean;
  username?: string;
  windowReady?: boolean;
}

export const initFeedWidth: CSSProperties = { width: 4 * Dimension.CARD_W };

const PostFeed = ({
  hasAuthorLink = true,
  hasDate = true,
  initPosts = [],
  limitPosts = Number.MAX_SAFE_INTEGER,
  paginateLimit = PAGINATE_LIMIT,
  publicPosts = true,
  ready = true,
  username = "",
  windowReady = true,
}: IPostFeed) => {
  const windowLoaded = useWindowLoaded();
  const { posts, limitReached, status, loadMore } = usePaginatePosts(
    ready && typeof window !== undefined,
    publicPosts,
    initPosts,
    username,
    paginateLimit
  );

  function renderLoadMore() {
    return limitReached || posts.length >= limitPosts ? (
      <div style={{ height: 40, width: 40 }} />
    ) : status === Status.PENDING ? (
      <CircleLoader height={40} width={40} />
    ) : (
      <StyledButton label="Load more" onClick={loadMore} />
    );
  }

  return (
    <WindowLoaded ready={windowReady}>
      <PostFeedDiv style={windowLoaded ? null : initFeedWidth}>
        {posts.map((post, index) => (
          <PostCard
            key={index}
            post={post}
            hasAuthorLink={hasAuthorLink}
            hasDate={hasDate}
          />
        ))}
        {status !== Status.PENDING && posts.length === 0 && (
          <DarkText text="No posts yet" variant="h5" />
        )}
      </PostFeedDiv>
      <br />
      {renderLoadMore()}
    </WindowLoaded>
  );
};

export default PostFeed;
