import { PageRoute, Status, ToastMessage } from "enums";
import { AppContext, useAsync, useKeyListener, useRefClick } from "hooks";
import { deletePost } from "lib/client";
import { ServerError } from "lib/server";
import { useCallback, useContext, useRef } from "react";
import { toast } from "react-hot-toast";
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
  const handleClose = useCallback(() => setShowDelete(false), [setShowDelete]);
  const modalRef = useRef(null);
  useRefClick(modalRef, handleClose, showDelete);

  useKeyListener("Escape", handleClose);

  const { execute: handleDelete, status: deleteStatus } = useAsync<
    IResponse,
    ServerError
  >(
    () => deletePost(post),
    () => {
      updatePostSlugs(user);
      toast.success(ToastMessage.POST_DELETED);
      // give server time to reset posts cache as this is not awaited in delete handler
      setTimeout(() => routerPush(PageRoute.MY_POSTS), 1000);
    },
    (r: IResponse) => r.status === 200,
    false
  );

  const buttons = [
    {
      text: "Cancel",
      action: handleClose,
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
