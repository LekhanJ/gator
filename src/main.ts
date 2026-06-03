import { handlerLogin, handlerRegister, handlerAgg, handlerAddFeed, handlerUsers, registerCommand, runCommand, type CommandsRegistry } from "./commander.js"
import { argv } from 'node:process';
import { assertExists } from "./utils.js";

const registry: CommandsRegistry = {};

registerCommand(registry, "login", handlerLogin);
registerCommand(registry, "register", handlerRegister);
registerCommand(registry, "users", handlerUsers);
registerCommand(registry, "agg", handlerAgg);
registerCommand(registry, "addfeed", handlerAddFeed);

async function main() {
  const args = argv.slice(2);

  if (args.length < 1) {
    console.error("Not enough arguments were provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  assertExists(cmdName);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
      if (err instanceof Error) {
          console.error(err.message);
      } else {
          console.error(err);
      }

      process.exit(1);
  }

  process.exit(0)
}

main()