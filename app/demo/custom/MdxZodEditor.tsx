"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { JsxComponentDescriptor, MdastJsx } from "@mdxeditor/editor";
import {
  NestedLexicalEditor,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
} from "@mdxeditor/editor";
import { Settings, Trash } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { parseAttributeValue, useQueryAttributes } from "./parse-attributes";

type ZodObjectOrWrapped =
  | z.ZodEffects<z.ZodObject<any, any>>
  | z.ZodObject<any, any>;

export type MdxZodEditorProps<F extends z.ZodType<any, any, any>> = {
  schema: F;
  mdastNode: MdastJsx;
  descriptor: JsxComponentDescriptor;
  children: (props: z.infer<F>) => JSX.Element | null;
  inline?: boolean;
  className?: string;
};

export function MdxZodEditor<F extends ZodObjectOrWrapped>(
  props: MdxZodEditorProps<F>
) {
  const updateMdastNode = useMdastNodeUpdater();
  const removeNode = useLexicalNodeRemove();
  const [open, setOpen] = useState(false);

  const { data: defaultValues } = useQueryAttributes(
    props.mdastNode.attributes
  );

  const Component = props.children;

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <div
        className={cn(
          "flex group relative",
          {
            inline: props.inline,
          },
          props.className
        )}
        {...(props.inline ? {} : { "data-jsx-element": true })}
      >
        <div
          className={cn(
            "group-hover:flex hidden z-50 flex-col items-center gap-1",
            {
              "absolute -left-4 -top-4 flex-row": props.inline,
              "absolute -top-8 right-0 flex-row": !props.inline,
            }
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              removeNode();
            }}
          >
            <Trash size={12} />
          </Button>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              <Settings size={12} />
            </Button>
          </DialogTrigger>
        </div>
        <div
          className={cn("flex no-margin flex-1 flex-col gap-1", {
            inline: props.inline,
          })}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Component {...defaultValues}>
            {props.descriptor.hasChildren ? (
              <div className={cn("force-prose-style pb-4 border", {})}>
                <NestedLexicalEditor<any>
                  block={props.descriptor.kind === "flow"}
                  getContent={(node) => {
                    return node.children;
                  }}
                  contentEditableProps={{
                    className: "bg-background text-foreground",
                  }}
                  getUpdatedMdastNode={(mdastNode, children) => {
                    return { ...mdastNode, children } as any;
                  }}
                />
              </div>
            ) : null}
          </Component>
        </div>
      </div>
      <DialogContent className="w-96 overflow-auto" style={{ maxHeight: 500 }}>
        <AutoForm
          formSchema={props.schema}
          // @ts-ignore
          fieldConfig={{
            children: {
              fieldType: "textarea",
            },
          }}
          values={defaultValues}
          onSubmit={async (values) => {
            const result = Object.entries(values)
              .map(([key, value]) => {
                const finalValue = formatResult(value);

                if (finalValue === undefined) {
                  return undefined;
                }
                return {
                  type: "mdxJsxAttribute" as const,
                  name: key,
                  value: parseAttributeValue(value),
                };
              })
              .filter(Boolean);

            updateMdastNode({
              type: "mdxJsxFlowElement",
              // @ts-expect-error
              attributes: result,
            });
            setOpen(false);
          }}
        >
          <AutoFormSubmit />
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
}

const formatResult = (result: unknown) => {
  if (!result) {
    return undefined;
  }

  // if boolean, return 1 or 0
  if (typeof result === "boolean") {
    return String(result ? 1 : 0);
  }

  // if number, return number
  if (typeof result === "number") {
    return String(result);
  }

  return String(result);
};
