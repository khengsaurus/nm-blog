import { Dimension } from "enums";
import { useWindowLoaded } from "hooks";
import { CSSProperties } from "react";
import { IPost } from "types";
import PostCard from "./PostCard";
import { PostFeedDiv } from "./StyledComponents";

interface IPostFeed {
  posts: IPost[];
  hasAuthorLink?: boolean;
  hasDate?: boolean;
}

export const initFeedWidth: CSSProperties = { width: 4 * Dimension.CARD_W };

const PostFeed = ({
  posts,
  hasAuthorLink = true,
  hasDate = true,
}: IPostFeed) => {
  const windowLoaded = useWindowLoaded();

  return (
    <PostFeedDiv style={windowLoaded ? null : initFeedWidth}>
      {posts.map((post, index) => (
        <PostCard
          key={index}
          post={post}
          hasAuthorLink={hasAuthorLink}
          hasDate={hasDate}
        />
      ))}
    </PostFeedDiv>
  );
};

export default PostFeed;
