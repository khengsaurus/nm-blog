import { Size } from "enums";
import { AppContext } from "hooks";
import { useContext } from "react";
import { Oval } from "react-loader-spinner";
import { Centered } from "./StyledComponents";

interface ILoader {
  id?: string;
  size?: Size;
  strokeWidth?: number;
}

const sizeMap = {
  [Size.XS]: { height: 10, width: 10 },
  [Size.S]: { height: 22, width: 22 },
  [Size.M]: { height: 40, width: 40 },
  [Size.L]: { height: 100, width: 100 },
};

export const CircleLoader = ({
  id = "loading-indicator",
  size = Size.M,
  strokeWidth = 6,
}: ILoader) => {
  const { theme } = useContext(AppContext);
  const dim = sizeMap[size];

  return (
    <Oval
      ariaLabel={id}
      height={dim.height}
      width={dim.width}
      strokeWidth={strokeWidth}
      strokeWidthSecondary={strokeWidth}
      color={theme?.highlightColor || "rgb(230, 230, 230)"}
      secondaryColor="transparent"
    />
  );
};

export const PageLoader = () => {
  return (
    <Centered style={{ marginTop: "calc(50vh - 120px)" }}>
      <CircleLoader size={Size.L} strokeWidth={2} />
    </Centered>
  );
};
