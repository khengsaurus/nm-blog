interface IItemPage {
  itemId: string;
}

export async function getServerSideProps({ params }) {
  const { itemId } = params;

  return {
    props: { itemId },
  };
}

const UserProfilePage = ({ itemId }: IItemPage) => {
  return <main>{`Item ${itemId}`}</main>;
};

export default UserProfilePage;
