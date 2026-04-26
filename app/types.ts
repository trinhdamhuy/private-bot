export type Command = {
  name: string;
  description?: string;
  options?: CommandOption[];
  type?: number;
};

export type CommandOption = {
  name: string;
  description: string;
  required: boolean;
  type: number;
};
