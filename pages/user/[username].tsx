interface IProfilePageP {
  username: string;
}

export async function getServerSideProps({ params }) {
  const { username } = params;

  return {
    props: { username },
  };
}

const UserProfilePage = ({ username }: IProfilePageP) => {
  return <main>{`${username}'s profile page`}</main>;
};

export default UserProfilePage;
