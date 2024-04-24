/* eslint-disable react/no-children-prop */
"use client";
// InitializedMDXEditor.tsx
import {
  BoldItalicUnderlineToggles,
  Button,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  JsxComponentDescriptor,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  insertJsx$,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  toolbarPlugin,
  usePublisher,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import type { ForwardedRef } from "react";
import { MdxZodEditor } from "./custom/MdxZodEditor";
import { Spoiler, SpoilerSchema } from "./custom/Spoiler";

const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "Spoiler" as const,
    kind: "flow",
    props: [{ name: "id", type: "string" }],
    hasChildren: true,
    Editor: (props) => (
      <MdxZodEditor schema={SpoilerSchema} {...props} children={Spoiler} />
    ),
  },
];

// a toolbar button that will insert a JSX element into the editor.
const InsertSpoiler = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <Button
      onClick={() =>
        insertJsx({
          name: "Spoiler",
          kind: "text",
          props: {
            title: "Title",
          },
        })
      }
    >
      Spoiler
    </Button>
  );
};

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkDialogPlugin(),
        linkPlugin(),
        quotePlugin(),
        tablePlugin(),
        jsxPlugin({ jsxComponentDescriptors }),
        markdownShortcutPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            "": "None",
            js: "JavaScript",
            css: "CSS",
            html: "HTML",
            jsx: "JavaScript React",
            tsx: "TypeScript React",
            ts: "TypeScript",
            bash: "Bash",
            javascript: "JavaScript",
            typescript: "TypeScript",
            json: "JSON",
            py: "Python",
            java: "Java",
            ruby: "Ruby",
            go: "Go",
            yaml: "YAML",
            sh: "Shell",
            sql: "SQL",
            md: "Markdown",
            xml: "XML",
            php: "PHP",
          },
        }),
        diffSourcePlugin({
          diffMarkdown: props.markdown,
          viewMode: "rich-text",
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <DiffSourceToggleWrapper>
                <UndoRedo />

                <ConditionalContents
                  options={[
                    {
                      when: (editor) => editor?.editorType === "codeblock",
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                    {
                      fallback: () => (
                        <>
                          <Separator orientation="vertical" className="h-6" />
                          <BoldItalicUnderlineToggles />
                          <ListsToggle />
                          <Separator orientation="vertical" className="h-6" />
                          <CreateLink />
                          <Separator orientation="vertical" className="h-6" />
                          <InsertCodeBlock />
                          <Separator orientation="vertical" className="h-6" />
                          <InsertSpoiler />
                        </>
                      ),
                    },
                  ]}
                />
              </DiffSourceToggleWrapper>
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
