import { PageLoader } from "components";
import { useWindowLoaded } from "hooks";

interface IWindowLoaded {
  children: any;
  ready?: boolean;
}

const WindowLoaded = ({ children, ready = true }: IWindowLoaded) => {
  const windowLoaded = useWindowLoaded();

  return ready && windowLoaded ? children : <PageLoader />;
};

export default WindowLoaded;
