import React from "react";
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
  color = "rgb(50,50,50)",
}: ILoader) => {
  return (
    <Oval
      ariaLabel={id}
      height={height}
      width={width}
      strokeWidth={strokeWidth}
      strokeWidthSecondary={strokeWidth}
      color={color}
      secondaryColor="transparent"
    />
  );
};
