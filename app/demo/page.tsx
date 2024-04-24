"use client";

import { useLocalStorage } from "usehooks-ts";
import { ForwardRefEditor } from "./ForwardRefEditor";

export default function Page() {
  const [markdown, setMarkdonw] = useLocalStorage(
    "markdown",
    `Hello Markdown Demo !`
  );
  return (
    <div className="max-w-2xl m-auto w-full my-8 bg-white">
      <ForwardRefEditor
        markdown={markdown}
        onChange={(newMarkdown) => {
          setMarkdonw(newMarkdown);
        }}
      />
    </div>
  );
}
