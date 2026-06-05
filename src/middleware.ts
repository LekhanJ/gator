import type { CommandHandler } from "./commander.js";
import { readConfig } from "./config.js";
import { getUser } from "./lib/db/queries/users.js";
import type { User } from "./schema.js";
import { assertExists } from "./utils.js";

export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const config = readConfig();

        const username = config.currentUserName;
        assertExists(username, "No user is currently logged in");

        const user = await getUser(username);
        assertExists(user, `User ${username} not found`);

        await handler(cmdName, user, ...args);
    }
}