import { markdown } from "lib/client";
import { useEffect, useState } from "react";

const useMarkdown = (hasMarkdown: boolean, theme: string, body: string) => {
  const [_markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasMarkdown && theme && body) {
      setMarkdown(markdown(body, theme));
    } else {
      setMarkdown(body);
    }
  }, [hasMarkdown, theme, body]);

  return _markdown;
};

export default useMarkdown;
