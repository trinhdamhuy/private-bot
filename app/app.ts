import "dotenv/config";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
} from "discord-interactions";
import { VerifyDiscordRequest, DiscordRequest } from "./utils.js";
import express, { Request, Response } from "express";
import { ComponentType, TextInputStyle } from "discord.js";

// Create an express app
const app = express();
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY!) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req: Request, res: Response) {
  // Interaction type and data
  const { type, data } = req.body;
  const channelId = req.body.channel?.id ?? req.body.channel_id;

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
      const text = data.options?.find((option: { name: string }) => option.name === "message")
        ?.value as string | undefined;
      const replyTo = data.options?.find((option: { name: string }) => option.name === "reply_to")
        ?.value as string | undefined;
      const tts = data.options?.find((option: { name: string }) => option.name === "tts")?.value as
        | boolean
        | undefined;

      if (!text || !text.trim()) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Message content is invalid!",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      if (replyTo && !/^\d+$/.test(replyTo.trim())) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "reply_to must be a valid Discord message ID.",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      try {
        await DiscordRequest(`channels/${channelId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: text.trim(),
            tts: tts ?? false,
            allowed_mentions: {
              parse: ["users", "roles"],
              replied_user: true,
            },
            ...(replyTo?.trim()
              ? {
                  message_reference: {
                    message_id: replyTo.trim(),
                    channel_id: channelId,
                    fail_if_not_exists: true,
                  },
                }
              : {}),
          }),
        });
      } catch (error) {
        console.error(error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Could not send message. Check `reply_to` message ID and try again.",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Anonymous message sent.",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    if (name === "Anonymous Reply") {
      const targetMessageId = data.target_id as string | undefined;
      if (!targetMessageId || !channelId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Cannot detect target message for reply.",
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }

      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: `anon_reply:${channelId}:${targetMessageId}`,
          title: "Anonymous Reply",
          components: [
            {
              type: ComponentType.Label,
              custom_id: "message_label",
              label: "Your anonymous reply",
              components: [
                {
                  type: ComponentType.TextInput,
                  custom_id: "message",
                  label: "Your message",
                  style: TextInputStyle.Paragraph,
                  required: true,
                },
              ],
            },
            {
              type: ComponentType.Label,
              custom_id: "tts_label",
              label: "Enable TTS? (true/false)",
              components: [
                {
                  type: ComponentType.Checkbox,
                  custom_id: "tts",
                  value: false,
                },
              ],
            },
          ],
        },
      });
    }
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    const customId = data.custom_id as string | undefined;
    if (!customId?.startsWith("anon_reply:")) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Unsupported modal submission.",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    const [, targetChannelId, targetMessageId] = customId.split(":");
    const text = data.components
      ?.flatMap(
        (component: { components?: { custom_id: string; value: string }[] }) =>
          component.components ?? [],
      )
      .find((component: { custom_id: string }) => component.custom_id === "message")?.value as
      | string
      | undefined;
    const tts = data.components
      ?.flatMap(
        (component: { components?: { custom_id: string; value: string }[] }) =>
          component.components ?? [],
      )
      .find((component: { custom_id: string }) => component.custom_id === "tts")?.value as
      | boolean
      | undefined;

    if (!text?.trim() || !targetChannelId || !targetMessageId) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Reply content or target message is invalid.",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    try {
      await DiscordRequest(`channels/${targetChannelId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: text.trim(),
          tts: tts ?? false,
          allowed_mentions: {
            parse: ["users", "roles"],
            replied_user: false,
          },
          message_reference: {
            message_id: targetMessageId,
            channel_id: targetChannelId,
            fail_if_not_exists: true,
          },
        }),
      });
    } catch (error) {
      console.error(error);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Could not send anonymous reply. Please try again.",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Anonymous reply sent.",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Listening on port", PORT);
  });
}

export default app;
