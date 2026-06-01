import { setUser } from "./config.js";
import { assertExists } from "./utils.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length !== 1) {
        throw new Error("The login command expects a single argument, the username");
    }
    
    const username = args[0];

    assertExists(username, "Username is missing");

    setUser(username);

    console.log("User has been set");
    
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    if (!registry[cmdName]) {
        throw new Error("Command does not exist!");
    }
    const handler = registry[cmdName];

    handler(cmdName, ...args);
}