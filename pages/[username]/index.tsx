import { RowWrap } from "components";
import PostCard from "components/PostCard";
import { mongoConnection } from "lib/server";
import React from "react";
import { IUser } from "types";
import { userDocToObj } from "../../util";

interface IUserPageProps {
  user: IUser;
}

export async function getServerSideProps({ params, res }) {
  const { username } = params;
  console.info(`-> [${username}] getServerSideProps() `);
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=30"
  );

  const { User } = await mongoConnection();

  const userQuery = await User.findOne({ username })
    .select(["-password"])
    .populate({ path: "posts", select: "-user", options: { limit: 5 } })
    .lean()
    .exec();
  const user = userDocToObj(userQuery);

  return {
    props: { user },
  };
}

const UserPage = (props: IUserPageProps) => {
  const { user } = props;
  return (
    <main>
      <section className="header">
        <h3>{user?.username}</h3>
      </section>
      <RowWrap>
        {user?.posts.map((post, index) => (
          <PostCard key={index} post={post} hasAuthorLink={false} />
        ))}
      </RowWrap>
    </main>
  );
};

export default UserPage;
