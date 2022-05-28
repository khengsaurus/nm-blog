import { Link } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { IUser } from "types";

interface IAuthorLinkProps {
  author?: IUser;
  title?: boolean;
}

const AuthorLink = ({ author, title = false }: IAuthorLinkProps) => {
  const router = useRouter();

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/${author.username}`);
  }

  return (
    <Link onClick={handleClick} underline="hover">
      {title ? <h4>{`By ${author?.username}`}</h4> : `By ${author?.username}`}
    </Link>
  );
};

export default AuthorLink;
