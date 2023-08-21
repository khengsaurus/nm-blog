import mongoose, {
  ClientSession,
  FilterQuery,
  Connection as MongooseConnection,
  Schema,
} from "mongoose";
import { IS_DEV } from "../consts";
import { ConnectionType } from "../enums";
import ConnectionInstance from "./ConnectionInstance";

export const MongoUserSchema = new Schema<IUser>({
  avatarKey: Schema.Types.String,
  bio: Schema.Types.String,
  email: Schema.Types.String,
  password: Schema.Types.String,
  username: Schema.Types.String,
  isAdmin: Schema.Types.Boolean,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export const MongoPostSchema = new Schema<IPost>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: Schema.Types.String,
  title: Schema.Types.String,
  slug: Schema.Types.String,
  body: Schema.Types.String,
  isPrivate: Schema.Types.Boolean,
  hasMarkdown: Schema.Types.Boolean,
  imageKey: Schema.Types.String,
  files: [
    {
      type: Schema.Types.Map,
      key: Schema.Types.String,
      name: Schema.Types.String,
      uploaded: Schema.Types.Number,
    },
  ],
});

class MongoConnection extends ConnectionInstance {
  private mongoUrl = IS_DEV
    ? process.env.MONGODB_URI_DEV
    : process.env.MONGODB_URI;
  private connection: MongooseConnection;
  private user: mongoose.Model<any>;
  private post: mongoose.Model<any>;

  constructor(id?: string) {
    super(id);
    this.type = ConnectionType.MONGO;
    MongoUserSchema.set("timestamps", true);
    MongoPostSchema.set("timestamps", true);
    MongoPostSchema.set("toObject", { getters: true, flattenMaps: true });
    this.user = mongoose.models.User || mongoose.model("User", MongoUserSchema);
    this.post = mongoose.models.Post || mongoose.model("Post", MongoPostSchema);
  }

  initConnection(): Promise<MongoConnection> {
    return new Promise((resolve, reject) => {
      if (this.connection) return resolve(this);

      // https://mongoosejs.com/docs/connections.html#connection_pools
      mongoose
        .connect(this.mongoUrl, { connectTimeoutMS: 4_000, maxPoolSize: 5 })
        .then((conn) => {
          this.connection = conn.connection;
          // TEST: wrap the following in setTimeout to test creating duplicate connections in the case of connection delay/failure
          this.ready = true;
          this.emitter.emit("ready");
          this.deferMarkForClose();
          resolve(this);
        })
        .catch(reject);
    });
  }

  close() {
    // console.log(`closing connection mongo-${this.id}`);
    return this.connection?.close() || Promise.resolve();
  }

  async startSession(): Promise<ClientSession> {
    return new Promise((resolve, reject) =>
      this.initConnection()
        .then(() => this.connection.startSession())
        .then(resolve)
        .catch(reject)
    );
  }

  // -------------------- User --------------------

  checkUserExists(filter: FilterQuery<IUser>) {
    return this.user.exists(filter);
  }

  findUser(filter: FilterQuery<IUser>) {
    return this.user.findOne(filter);
  }

  findUserById(id: string) {
    return this.user.findById(id);
  }

  createUser(user) {
    return this.user.create(user);
  }

  updateUser(...args) {
    return this.user.findByIdAndUpdate(...args);
  }

  deleteUser(id: string) {
    return this.findUserById(id).then((user) => {
      if (!user) return Promise.resolve();
      if (!user.username) return this.user.findByIdAndDelete(id); // no username, can delete
      return Promise.reject(401); // has username
    });
  }

  // -------------------- Post --------------------

  checkPostExists(filter: FilterQuery<IPost>) {
    const { userId, slug } = filter;
    return this.post.exists({ user: userId, slug });
  }

  findPost(filter: FilterQuery<IPost>) {
    const { username, slug } = filter;
    return this.post.findOne({ username, slug });
  }

  findPostById(id: string) {
    return this.post.findById(id);
  }

  findPostsByQuery(query) {
    return this.post.find(query);
  }

  createPost(post): Promise<IPost> {
    const newPost = new this.post(post);
    return newPost.save();
  }

  updatePost(id, set, callback) {
    return this.post.findByIdAndUpdate(id, set, null, callback);
  }

  deletePost(id: string) {
    return this.post.findByIdAndDelete(id);
  }
}

export default MongoConnection;
