import { Link } from "@mui/material";
import { Row } from "components";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import { useContext, useMemo } from "react";
import { IUser } from "types";
import { StyledText } from "./StyledMui";

interface IAuthorLinkProps {
  author?: IUser;
  title?: boolean;
}

const AuthorLink = ({ author, title = false }: IAuthorLinkProps) => {
  const { history, user, routerPush } = useContext(AppContext);
  const label = `By ${author?.username}`;

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    routerPush(
      author.username === user?.username
        ? PageRoute.MY_POSTS
        : `/${author.username}`
    );
  }

  const renderText = useMemo(() => {
    return (
      history.length > 0 &&
      history[history.length - 1] === `/${author?.username}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author?.username, JSON.stringify(history)]);

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
