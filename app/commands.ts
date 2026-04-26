import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { Command } from "./types.js";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

const MESSAGE_COMMAND: Command = {
  name: "message",
  description: "Send anonymous message",
  options: [
    {
      name: "message",
      description: "Your message",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reply_to",
      description: "Message ID to reply to",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "tts",
      description: "Send as TTS (true/false)",
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    },
  ],
};

const ANONYMOUS_REPLY_CONTEXT_COMMAND: Command = {
  name: "Anonymous Reply",
  type: ApplicationCommandType.Message,
};

const ALL_COMMANDS = [MESSAGE_COMMAND, ANONYMOUS_REPLY_CONTEXT_COMMAND];

InstallGlobalCommands(process.env.APP_ID!, ALL_COMMANDS);
