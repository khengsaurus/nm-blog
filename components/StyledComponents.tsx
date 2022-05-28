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

export const PostFeed = styled(Row)`
  justify-content: center;
  flex-wrap: wrap;
  width: clamp(360px, 85vw, 1200px);
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
