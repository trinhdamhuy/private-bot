export type Command = {
  name: string;
  description: string;
  options: CommandOption[];
};

export type CommandOption = {
  name: string;
  description: string;
  required: boolean;
  type: number;
};
