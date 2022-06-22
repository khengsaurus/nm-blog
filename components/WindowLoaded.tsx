import { Centered, CircleLoader } from "components";
import { useWindowLoaded } from "hooks";
import { CSSProperties } from "react";

interface IWindowLoaded {
  children: any;
  ready?: boolean;
  mainStyle?: CSSProperties;
}

const defaultMainStyle = { marginTop: "calc(50vh - 120px)" };

const WindowLoaded = ({
  children,
  ready = true,
  mainStyle = defaultMainStyle,
}: IWindowLoaded) => {
  const windowLoaded = useWindowLoaded();

  return ready && windowLoaded ? (
    children
  ) : (
    <Centered style={mainStyle}>
      <CircleLoader height={100} width={100} strokeWidth={2} />
    </Centered>
  );
};

export default WindowLoaded;
