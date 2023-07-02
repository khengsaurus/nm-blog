interface IHasId {
  id: string;
  _id?: string;
}

interface IHasTimestamps {
  createdAt: string;
  updatedAt: string;
}

interface IHasImage {
  imageKey: string;
}

interface IPostFile {
  uploaded: number;
  // only exists on uploaded files
  name?: string;
  key?: string;
  // only exists on un/newly-uploaded files
  status?: FileStatus;
  file?: File;
}

interface IPost
  extends Partial<IHasId>,
    Partial<IHasImage>,
    Partial<IHasTimestamps> {
  slug?: string;
  user?: IUser;
  username?: string;
  title?: string;
  body?: string;
  files?: IPostFile[];
  isPrivate?: boolean;
  hasMarkdown?: boolean;
}

interface IUser extends IHasId, Partial<IHasTimestamps> {
  id: string;
  avatarKey: string;
  bio: string;
  email: string;
  password: string;
  username: string;
  posts: IPost[];
  isAdmin: boolean;
}

/*------------------------------ API ------------------------------*/

interface IRequest {
  userId: string;
}

interface IPostReq extends IPost, IRequest {
  update: boolean;
  limit?: number;
  sort?: 1 | -1;
  cursor?: string;
  fresh?: boolean;
  search?: string;
  userId?: string;
}

interface IUserReq extends IUser, IRequest {
  login: boolean;
  action: APIAction;
  isPrivate?: boolean;
}
