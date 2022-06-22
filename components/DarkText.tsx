import DarkContainer from "./DarkContainer";
import { IStyledTextProps, StyledText } from "./StyledMui";

const DarkText = (props: IStyledTextProps) => {
  return (
    <DarkContainer>
      <StyledText {...props} />
    </DarkContainer>
  );
};

export default DarkText;
