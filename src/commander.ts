import { readConfig, setUser } from "./config.js";
import { createUser, getUser, getUsers } from "./lib/db/queries/users.js";
import { assertExists } from "./utils.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("The login command expects a single argument, the username");
    }
    
    const username = args[0];

    assertExists(username, "Username is missing");

    const result = await getUser(username);
    if (!result) {
        throw new Error("User does not exists. Please register before logging in!");
    }

    setUser(username);

    console.log("Login successful. User has been set");
    
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("The register command expects a single argument, the username");
    }

    const username = args[0];

    assertExists(username, "Username is missing");

    const result = await getUser(username);
    if (result) {
        throw new Error("User already exists. Please login");
    }

    const createdUser = await createUser(username);

    setUser(username);

    console.log(
        `User created: ${JSON.stringify(createdUser)}`
    );
}

export async function handlerUsers(cmdName: string): Promise<void> {
    const users = await getUsers();
    const config = readConfig();
    users.forEach((user) => {
        if (user.name === config.currentUserName) {
            console.log(`${user.name} (current)`);
        } else {
            console.log(user.name);
        }
    })
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];

    assertExists(
        handler,
        `Command ${cmdName} does not exist`
    );

    await handler(cmdName, ...args);
}