import { StyledCenterText } from "../styles/StyledMui";

interface HomePageProps {
  markup: React.FC | JSX.Element;
  title: string;
}

const HomePage = ({ markup, title }: HomePageProps) => {
  return (
    <div className="home-page">
      <StyledCenterText text={title} variant="h6" padding="0px 10px 10px" />
      <div className="centered">{markup}</div>
    </div>
  );
};

export default HomePage;
