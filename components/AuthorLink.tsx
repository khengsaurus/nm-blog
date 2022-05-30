import { Link } from "@mui/material";
import { PageRoute } from "enums";
import { AppContext } from "hooks";
import React, { useContext } from "react";
import { IUser } from "types";

interface IAuthorLinkProps {
  author?: IUser;
  title?: boolean;
}

const AuthorLink = ({ author, title = false }: IAuthorLinkProps) => {
  const { user, router } = useContext(AppContext);

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    router.push(
      author.username === user?.username
        ? PageRoute.MY_PROFILE
        : `/${author.username}`
    );
  }

  return (
    <Link onClick={handleClick} underline="hover">
      {title ? (
        <h3>{`By ${author?.username}`}</h3>
      ) : (
        <p className="author">{`By ${author?.username}`}</p>
      )}
    </Link>
  );
};

export default AuthorLink;
