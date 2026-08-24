import { z } from "zod";

const phoneRegex = new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/);

export const ContactSchema = z.object({
  fullName: z.string().min(1, { message: "Please enter your full name." }),
  phone: z
    .string()
    .min(1, { message: "Please enter your phone." })
    .regex(phoneRegex, "Invalid phone number."),
  email: z
    .string()
    .min(1, { message: "Please enter a valid email address." })
    .email({ message: "Invalid email address." }),
  message: z.string().min(1, { message: "Please enter a message." }),
});

export type contactSchemaType = z.infer<typeof ContactSchema>;

/**
 * Space — freeform infinite canvas. Borderless by design:
 * text/heading cards render as bare text on the canvas (no box),
 * images & links get subtle card chrome, arrows connect things.
 */

export const spaceItemSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "heading", "link", "image", "arrow"]),
  /** web | youtube | x — lets the canvas render proper embeds */
  kind: z.string().optional(),
  /** youtube video id / x tweet id */
  embedId: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(80).max(900).optional(),
  rotation: z.number().min(-15).max(15).default(0),
  color: z.string().default("default"),

  // text / heading
  text: z.string().optional(),
  fontSize: z.number().min(10).max(72).optional(),

  // link
  url: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),

  // image
  src: z.string().optional(),
  caption: z.string().optional(),

  // arrow
  x2: z.number().optional(),
  y2: z.number().optional(),
  stroke: z.number().min(1).max(8).optional(),

  createdAt: z.number(),
});

export const spaceDocSchema = z.object({
  items: z.array(spaceItemSchema).default([]),
});

export type SpaceItem = z.infer<typeof spaceItemSchema>;
export type SpaceDoc = z.infer<typeof spaceDocSchema>;
