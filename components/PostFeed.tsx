import {
  CircleLoader,
  DarkText,
  Input,
  PostCard,
  PostFeedDiv,
  StyledButton,
  WindowLoaded,
} from "components";
import { PAGINATE_LIMIT } from "consts";
import { Dimension, Status } from "enums";
import { usePaginatePosts, useWindowDimensions, useWindowLoaded } from "hooks";
import { CSSProperties, useMemo, useState } from "react";
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
  title?: string;
  hasSearch?: boolean;
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
  title = "",
  hasSearch = false,
}: IPostFeed) => {
  const windowLoaded = useWindowLoaded();
  const [searchStr, setSearchStr] = useState("");
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

  const { width } = useWindowDimensions();
  const feedWidth: CSSProperties = useMemo(() => {
    const cards = Math.floor((width - 100) / Dimension.CARD_W);
    return { width: `${cards * (Dimension.CARD_W + 12)}px` };
  }, [width]);

  return (
    <WindowLoaded ready={windowReady}>
      <PostFeedDiv style={windowLoaded ? feedWidth : initFeedWidth}>
        {(title || hasSearch) && (
          <section className="header">
            <DarkText text={title} variant="h3" />
            {hasSearch && (
              <Input
                label="Search"
                value={searchStr}
                onChange={(e) => setSearchStr(e.target.value)}
                inputProps={{ maxLength: 50 }}
              />
            )}
          </section>
        )}
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
