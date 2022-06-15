import styled from "styled-components";

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  transition: 300ms all;
`;

export const RowCentered = styled(Row)`
  justify-content: center;
`;

export const PostFeed = styled(Row)`
  flex-wrap: wrap;
  justify-content: center;
`;

export const Centered = styled(Column)`
  justify-content: center;
  justify-self: center;
  align-self: center;
  text-align: center;
`;

export const CenteredMain = styled(Centered)`
  height: 100vh;
  width: 100vw;
`;

export const AvatarSmall = styled.div`
  border-radius: 50%;
  height: 50px;
  width: 50px;
`;

export const AvatarMedium = styled.div`
  border-radius: 50%;
  height: 100px;
  width: 100px;
`;

export const AvatarLarge = styled.div`
  border-radius: 50%;
  height: 200px;
  width: 200px;
`;
