import styled from "styled-components";

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

export const ColumnReversed = styled(Column)`
  flex-direction: column-reverse;
`;

export const ColumnCentered = styled(Column)`
  justify-content: center;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  transition: 300ms all;
`;

export const RowReversed = styled(Row)`
  flex-direction: row-reverse;
`;

export const RowCentered = styled(Row)`
  justify-content: center;
`;

export const RowWrap = styled(Row)`
  justify-content: center;
  flex-wrap: wrap;
`;

export const Centered = styled(Column)`
  justify-content: center;
  justify-self: center;
  align-self: center;
  text-align: center;
`;
