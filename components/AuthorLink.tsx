import { Link } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import { IUser } from "types";

interface IAuthorLinkProps {
  author?: IUser;
}

const AuthorLink = ({ author }: IAuthorLinkProps) => {
  const router = useRouter();

  function handleClick(e: any) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/${author.username}`);
  }

  return (
    <Link variant="body1" onClick={handleClick} underline="hover">
      {`By ${author?.username}`}
    </Link>
  );
};

export default AuthorLink;
