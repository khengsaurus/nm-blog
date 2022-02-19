import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import sources from "../PhotosDB";
import { motion } from "framer-motion";

interface IItemComponentProps {
  item: any;
  id: string | number;
  onClick?: () => any;
}

const ItemComponent: React.FC<IItemComponentProps> = ({
  item,
  id,
  onClick,
}: IItemComponentProps) => {
  return (
    <div onClick={onClick}>
      <motion.h2 layoutId={`title-${item.id}`}>{`Lorem ipsum ${id}`}</motion.h2>
      <motion.figure layoutId={`image-${item.id}`}>
        <Image
          alt=""
          src={item.photo}
          width={200}
          height={200}
          objectFit="contain"
        />
      </motion.figure>
    </div>
  );
};

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <main>
      <div className="row">
        <div className="column tripple">
          {sources.slice(0, 2).map((item, id) => (
            <ItemComponent
              item={item}
              id={id}
              key={id}
              onClick={() => router.push(`/photo/${item.id}`)}
            />
          ))}
        </div>
        <div className="column tripple">
          {sources.slice(2, 4).map((item, id) => (
            <ItemComponent
              item={item}
              id={id + 2}
              key={id + 2}
              onClick={() => router.push(`/photo/${item.id}`)}
            />
          ))}
        </div>
        <div className="column tripple">
          {sources.slice(4, 6).map((item, id) => (
            <ItemComponent
              item={item}
              id={id + 4}
              key={id + 4}
              onClick={() => router.push(`/photo/${item.id}`)}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Home;
