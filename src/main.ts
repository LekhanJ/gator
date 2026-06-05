import { handlerLogin, handlerRegister, handlerAgg, handlerUnfollow, handlerFollowing, handlerFollow, handlerAddFeed, handlerUsers, registerCommand, runCommand, type CommandsRegistry } from "./commander.js"
import { argv } from 'node:process';
import { assertExists } from "./utils.js";
import { middlewareLoggedIn } from "./middleware.js";

const registry: CommandsRegistry = {};

registerCommand(registry, "login", handlerLogin);
registerCommand(registry, "register", handlerRegister);
registerCommand(registry, "users", handlerUsers);
registerCommand(registry, "agg", handlerAgg);
registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

async function main() {
	const args = argv.slice(2);

	if (args.length < 1) {
		console.error("Not enough arguments were provided");
		process.exit(1);
	}

	const cmdName = args[0];
	const cmdArgs = args.slice(1);

	assertExists(cmdName, "Command is missing");

	try {
		await runCommand(registry, cmdName, ...cmdArgs);
	} catch (err) {
		if (err instanceof Error)
			console.error(err.message);
		else
			console.error(err);

		process.exit(1);
	}

	process.exit(0)
}

main()