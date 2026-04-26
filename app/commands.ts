import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { Command } from "./types.js";

const MESSAGE_COMMAND: Command = {
  name: "message",
  description: "Send anonymous message",
  options: [
    {
      name: "message",
      description: "Your message",
      required: true,
      type: 3,
    },
  ],
};

const ALL_COMMANDS = [MESSAGE_COMMAND];

InstallGlobalCommands(process.env.APP_ID!, ALL_COMMANDS);
