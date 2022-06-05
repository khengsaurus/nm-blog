import { PageRoute, Status } from "enums";
import { AppContext, useAsync } from "hooks";
import { deletePost } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useContext } from "react";
import { IPost, IResponse } from "types";
import ActionModal from "./ActionModal";

interface IDeletePostModal {
  post: IPost;
  showDelete: boolean;
  setShowDelete: (b: boolean) => void;
}

const DeletePostModal = ({
  post,
  showDelete,
  setShowDelete,
}: IDeletePostModal) => {
  const { user, routerPush, updatePostSlugs } = useContext(AppContext);

  const { execute: handleDelete, status: deleteStatus } = useAsync<
    IResponse,
    ServerError
  >(
    () => deletePost(post),
    () => {
      updatePostSlugs(user);
      routerPush(PageRoute.HOME);
    },
    (r: IResponse) => r.status === 200,
    false
  );

  const buttons = [
    {
      text: "Cancel",
      action: () => setShowDelete(false),
    },
    {
      text: "Delete",
      action: handleDelete,
      disabled: deleteStatus !== Status.IDLE,
    },
  ];

  return (
    <ActionModal
      show={showDelete}
      text="Are you sure you wish to delete this post?"
      buttons={buttons}
    />
  );
};

export default DeletePostModal;
