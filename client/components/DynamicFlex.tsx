import React, { CSSProperties } from "react";

interface IDynamixFlex {
  children?: any;
  style?: CSSProperties;
}

const DynamicFlex = ({ children, style }: IDynamixFlex) => {
  return (
    <div className="dynamic-flex" style={style}>
      {children}
    </div>
  );
};

export default DynamicFlex;
