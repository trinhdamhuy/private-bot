import "dotenv/config";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { VerifyDiscordRequest, DiscordRequest } from "./utils.js";
import express, { Request, Response } from "express";

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req: Request, res: Response) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Log request bodies
  console.log(req.body);

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "message" command
    if (name === "message") {
      const text = data.options?.find(
        (option: { name: string }) => option.name === "message",
      )?.value;

      if (!text || !text.trim()) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Message content is invalid!",
            flags: 64,
          },
        });
      }

      await DiscordRequest(`channels/${req.body.channel.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: text?.trim(),
          allowed_mentions: {
            parse: [],
          },
        }),
      });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Anonymous message sent.",
          flags: 64,
        },
      });
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Listening on port", PORT);
  });
}

export default app;
