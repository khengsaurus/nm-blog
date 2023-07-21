import {
  CircleLoader,
  DarkText,
  Input,
  PostCard,
  PostFeedDiv,
  StyledButton,
  WindowLoaded,
} from "components";
import { PAGINATE_LIMIT, SEARCHBOX_ID } from "consts";
import { Dimension, Size, Status } from "enums";
import { usePaginatePosts, useWindowDimensions, useWindowLoaded } from "hooks";
import { useQueryState } from "next-usequerystate";
import { CSSProperties, useMemo } from "react";
import { IPost } from "types";

interface IPostFeed {
  title?: string;
  initPosts?: IPost[];
  username?: string;
  paginateLimit?: number;
  byCurrUser?: boolean;
  hasAuthorLink?: boolean;
  hasDate?: boolean;
  hasSearch?: boolean;
  publicPosts?: boolean;
  ready?: boolean;
  windowReady?: boolean;
}

export const initFeedWidth: CSSProperties = { width: 4 * Dimension.CARD_W };

const PostFeed = ({
  title = "",
  initPosts = [],
  username = "",
  paginateLimit = PAGINATE_LIMIT,
  byCurrUser = false,
  hasAuthorLink = true,
  hasDate = true,
  hasSearch = false,
  publicPosts = true,
  ready = true,
  windowReady = true,
}: IPostFeed) => {
  const windowLoaded = useWindowLoaded();
  const [searchStr, setSearchStr] = useQueryState("q", { history: "replace" });
  const { width } = useWindowDimensions();
  const { posts, limitReached, status, loadMore } = usePaginatePosts(
    ready && typeof window !== undefined,
    publicPosts,
    initPosts,
    username,
    searchStr,
    paginateLimit
  );

  function renderLoadMore() {
    return limitReached ? (
      <div style={{ height: 40, width: 40 }} />
    ) : status === Status.PENDING ? (
      <CircleLoader size={Size.M} />
    ) : (
      <StyledButton label="Load more" onClick={loadMore} />
    );
  }
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
                id={SEARCHBOX_ID}
                label="Search"
                value={searchStr || ""}
                onChange={(e) =>
                  setSearchStr(e.target.value, {
                    scroll: false,
                    shallow: true,
                  })
                }
                inputProps={{ maxLength: 50 }}
                style={{ marginLeft: "12px" }}
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
            byCurrUser={byCurrUser}
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
