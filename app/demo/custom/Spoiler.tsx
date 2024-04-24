import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from "zod";

export const SpoilerSchema = z.object({
  title: z.string(),
  children: z.string(),
});

type SpoilerProps = z.infer<typeof SpoilerSchema>;

export function Spoiler({ title, children }: SpoilerProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
