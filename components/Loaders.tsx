import { AppContext } from "hooks";
import { useContext } from "react";
import { Oval } from "react-loader-spinner";

interface ILoader {
  id?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircleLoader = ({
  id = "loading-indicator",
  height = 22,
  width = 22,
  strokeWidth = 6,
}: ILoader) => {
  const { theme } = useContext(AppContext);

  return (
    <Oval
      ariaLabel={id}
      height={height}
      width={width}
      strokeWidth={strokeWidth}
      strokeWidthSecondary={strokeWidth}
      color={theme?.highlightColor || "rgb(230, 230, 230)"}
      secondaryColor="transparent"
    />
  );
};
