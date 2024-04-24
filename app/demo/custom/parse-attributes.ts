import { useMdastNodeUpdater, type MdastJsx } from "@mdxeditor/editor";
import { useQuery } from "@tanstack/react-query";
import { stringify } from "javascript-stringify";
import { useEffect, useMemo } from "react";
import { useIsClient } from "usehooks-ts";

export async function executeInWorker(value: string) {
  const worker = new Worker(
    URL.createObjectURL(
      new Blob(
        [
          `
    onmessage = function(e) {
      let obj;
      try {
        obj = eval('(' + e.data + ')');
      } catch (error) {
        obj = error;
      }
      postMessage(obj);
    };
  `,
        ],
        { type: "application/javascript" }
      )
    )
  );

  worker.postMessage(value);

  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.onerror = reject;
  });
}

async function transformAttributes(attributes: MdastJsx["attributes"]) {
  const transformedAttributes = await Promise.all(
    attributes.map(async (curr) => {
      if (curr.type === "mdxJsxAttribute") {
        if (curr.name === "children") return null;

        if (
          typeof curr.value !== "string" &&
          curr.value?.type === "mdxJsxAttributeValueExpression"
        ) {
          const value = curr.value.value;
          return {
            name: curr.name,
            value: await executeInWorker(value),
          };
        }

        return {
          name: curr.name,
          value: curr.value,
        };
      }

      return null;
    })
  );

  return transformedAttributes.reduce<Record<string, unknown>>((acc, curr) => {
    if (curr) {
      acc[curr.name] = curr.value;
    }
    return acc;
  }, {});
}

export const useQueryAttributes = (attributes: MdastJsx["attributes"]) => {
  const isClient = useIsClient();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memorizedAttributes = useMemo(() => JSON.stringify(attributes), []);

  const query = useQuery({
    queryKey: ["attributes", memorizedAttributes],
    queryFn: async () => transformAttributes(attributes),
    enabled: isClient,
  });

  useEffect(() => {
    query.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]);

  return query;
};

export const useUpdateAttributes = (attributes: MdastJsx["attributes"]) => {
  const updateMdastNode = useMdastNodeUpdater();

  const update = (name: string, value: unknown) => {
    updateMdastNode({
      type: "mdxJsxFlowElement",
      attributes: [
        // @ts-expect-error
        ...attributes.filter(
          (t) => t.type === "mdxJsxAttribute" && t.name !== name
        ),
        {
          type: "mdxJsxAttribute",
          name,
          // @ts-expect-error
          value: parseAttributeValue(value),
        },
      ],
    });
  };

  return update;
};

export const parseAttributeValue = (value: unknown) => {
  return typeof value === "string"
    ? value
    : {
        type: "mdxJsxAttributeValueExpression",
        value: stringify(value),
      };
};
