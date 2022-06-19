import { Link } from "@mui/material";
import { Row } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext, useMemo } from "react";
import { IUser } from "types";
import { StyledText } from "./StyledMui";

interface IAuthorLinkProps {
  author?: IUser;
  username?: string;
  title?: boolean;
}

const AuthorLink = ({ username, author, title = false }: IAuthorLinkProps) => {
  const { history, user, routerPush } = useContext(AppContext);
  const _username = username || author?.username;
  const label = `By ${_username}`;

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    routerPush(
      _username === user?.username ? PageRoute.MY_POSTS : `/${_username}`
    );
  }

  const renderText = useMemo(() => {
    return (
      history.length > 0 && history[history.length - 1] === `/${_username}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_username, JSON.stringify(history)]);

  return renderText ? (
    title ? (
      <StyledText text={label} variant="h3" />
    ) : (
      <StyledText text={label} variant="body1" style={{ marginRight: 10 }} />
    )
  ) : title ? (
    <Row>
      <Link onClick={handleClick} underline="hover">
        <h3>{label}</h3>
      </Link>
    </Row>
  ) : (
    <Link onClick={handleClick} underline="hover">
      <p className="author">{label}</p>
    </Link>
  );
};

export default AuthorLink;
