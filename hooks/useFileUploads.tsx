import { IS_DEV, MAX_FILES, MAX_FILES_A, MAX_FILE_SIZE_MB } from "consts";
import { FileStatus, ToastMessage } from "enums";
import { getUploadedFileKey } from "lib/client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IPost, IPostFile, IUser } from "types";
import { checkFileSize, sleep } from "utils";

const maxFileSize = MAX_FILE_SIZE_MB * 1000 * 1000;

const useFileUploads = (user: IUser, post: IPost) => {
  const [files, setFiles] = useState<IPostFile[]>([]);
  const newFiles = useRef<Set<string>>(new Set());
  const fileKeysToRm = useRef<Set<string>>(new Set());
  const imgKeysToRm = useRef<Set<string>>(new Set());
  const uploadController = useRef<Map<string, AbortController>>(new Map());
  const filesChanged = useRef(false);
  const isAdmin = user?.isAdmin;

  useEffect(() => {
    setFiles(post?.files || []);
    setImgKey(post?.imageKey || "");
  }, [post]);

  const uploadFile = useCallback(
    async (newFile: IPostFile) => {
      const { file: _file, uploaded } = newFile;
      if (!user?.id || !_file) return;
      const controllerKey = `${_file.name}-${uploaded}`;
      if (uploadController.current.has(controllerKey)) return;

      const controller = new AbortController();
      uploadController.current.set(controllerKey, controller);
      getUploadedFileKey(user.id, _file, controller.signal)
        .then((key) => {
          /* important: use updater fn */
          setFiles((fs) =>
            fs.map((f) =>
              f.status === FileStatus.PENDING &&
              f.file?.name === _file?.name &&
              f.uploaded === uploaded
                ? {
                    status: FileStatus.UPLOADED,
                    uploaded: f.uploaded,
                    name: _file.name,
                    key,
                  }
                : f
            )
          );
          newFiles.current.add(key);
          filesChanged.current = true;
          toast.success(`Uploaded ${_file.name}`);
        })
        .catch((err) => {
          console.error(err);
          toast.error(`Failed to upload ${_file.name}`);
          controller.abort();
        })
        .finally(() => uploadController.current.delete(controllerKey));
    },
    [user?.id]
  );

  const handleAddFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isAdmin && !checkFileSize(event, toast.error)) return;
      const newFile: IPostFile = {
        status: FileStatus.PENDING,
        uploaded: new Date().valueOf(),
        file: event.target.files[0],
      };
      uploadFile(newFile);
      /* important: use updater fn */
      setFiles((fs) => [...fs, newFile]);
      filesChanged.current = true;
    },
    [isAdmin, uploadFile]
  );

  const handleRemoveFile = (file: IPostFile) => {
    const { file: _file, name, key, status, uploaded } = file;
    if (status === FileStatus.PENDING) {
      const controllerKey = `${name || _file?.name}-${uploaded}`;
      uploadController.current.get(controllerKey)?.abort();
    }
    if (key) fileKeysToRm.current.add(key);
    filesChanged.current = true;
    setFiles((fs) => fs.filter((f) => f !== file));
  };

  function handleDropFiles(newFiles: File[]) {
    const limitFiles = isAdmin ? MAX_FILES_A : MAX_FILES;
    let _limit = limitFiles - files.length + fileKeysToRm.current.size;
    const uploaded = new Date().valueOf();
    const sizeErr = newFiles.find((f) => f.size > maxFileSize);
    const files2 = [
      ...files,
      ...newFiles
        .filter((newFile, index) =>
          // skip files > maxFileSize
          newFile.size <= maxFileSize ? index < _limit : ++_limit && false
        )
        .map((file) => {
          return { file, uploaded, status: FileStatus.PENDING };
        }),
    ];
    files2.forEach((file) => {
      if (file.status === FileStatus.PENDING) {
        uploadFile(file);
      }
    });
    setFiles(files2);
    filesChanged.current = true;
    if (sizeErr) {
      toast.error(`The maximum file size is ${MAX_FILE_SIZE_MB}MB`);
    } else if (files2.length - files.length < newFiles.length) {
      toast.error(`Max ${limitFiles} files per post`);
    }
  }

  // For banner image
  const [newImg, _setNewImg] = useState<File>(null);
  const [imageKey, setImgKey] = useState("");
  const imgUpdated = !!newImg || imageKey !== post?.imageKey;

  /* Be sure to handle scenario where removing an existing pic, then canceling */
  const removeSavedImg = () => {
    if (post?.imageKey) {
      imgKeysToRm.current.add(post.imageKey);
    }
    if (imageKey) {
      imgKeysToRm.current.add(imageKey);
    }
  };

  const rmImg = () => {
    removeSavedImg();
    setImgKey("");
    _setNewImg(null);
  };

  const setNewImg = (img: File) => {
    if (!user?.id) return;
    _setNewImg(img);
    getUploadedFileKey(user.id, img)
      .then((key) => {
        setImgKey(key);
        removeSavedImg();
        newFiles.current.add(key);
      })
      .catch((err) => {
        // reset old image
        console.error(err);
        toast.error(ToastMessage.I_UPLOAD_FAIL);
        setImgKey(post?.imageKey || "");
        if (post?.imageKey) {
          // do not delete from S3
          imgKeysToRm.current.delete(post.imageKey);
        }
        _setNewImg(null);
      });
  };

  const resetRefs = () => {
    filesChanged.current = false;
    newFiles.current = new Set();
    fileKeysToRm.current = new Set();
    imgKeysToRm.current = new Set();
  };

  return {
    newImg,
    imageKey,
    imgUpdated,
    setNewImg,
    rmImg,
    resetRefs,

    files,
    filesChanged: filesChanged.current,
    getAddedFileKeys: () => Array.from(newFiles.current.values()),
    getRemovedFileKeys: () => [
      ...Array.from(fileKeysToRm.current.values()),
      ...Array.from(imgKeysToRm.current.values()),
    ],
    handleAddFile,
    handleDropFiles,
    handleRemoveFile,
  };
};

export default useFileUploads;
