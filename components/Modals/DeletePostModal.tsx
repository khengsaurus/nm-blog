import { PageRoute, Status } from "enums";
import { AppContext, useAsync, useRefClick } from "hooks";
import { deletePost } from "lib/client/tasks";
import { ServerError } from "lib/server";
import { useCallback, useContext, useRef } from "react";
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
  const modalRef = useRef(null);
  const close = useCallback(() => setShowDelete(false), [setShowDelete]);
  useRefClick(modalRef, close, showDelete);

  const { execute: handleDelete, status: deleteStatus } = useAsync<
    IResponse,
    ServerError
  >(
    () => deletePost(post),
    () => {
      updatePostSlugs(user);
      routerPush(PageRoute.MY_POSTS);
    },
    (r: IResponse) => r.status === 200,
    false
  );

  const buttons = [
    {
      text: "Cancel",
      action: close,
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
      ref={modalRef}
    />
  );
};

export default DeletePostModal;
