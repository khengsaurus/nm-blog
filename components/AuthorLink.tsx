import { Link } from "@mui/material";
import { Row } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext, useMemo } from "react";
import { StyledText } from "./StyledMui";

interface IAuthorLinkProps {
  username?: string;
  title?: boolean;
  disable?: boolean;
}

const AuthorLink = ({
  username,
  title = false,
  disable = false,
}: IAuthorLinkProps) => {
  const { history, user, routerPush } = useContext(AppContext);
  const label = `By ${username}`;

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    if (!disable) {
      routerPush(
        username === user?.username ? PageRoute.MY_POSTS : `/${username}`
      );
    }
  }

  const renderText = useMemo(() => {
    return history.length > 0 && history[history.length - 1] === `/${username}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, JSON.stringify(history)]);

  return renderText ? (
    title ? (
      <StyledText text={label} variant="h3" />
    ) : (
      <StyledText text={label} variant="body1" style={{ marginRight: 10 }} />
    )
  ) : title ? (
    <Row>
      <Link
        onClick={handleClick}
        underline="hover"
        style={disable ? { cursor: "default" } : null}
      >
        <h3>{label}</h3>
      </Link>
    </Row>
  ) : (
    <Link
      onClick={handleClick}
      underline="hover"
      style={disable ? { cursor: "default" } : null}
    >
      <p className="author">{label}</p>
    </Link>
  );
};

export default AuthorLink;
