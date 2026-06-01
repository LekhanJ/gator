import { handlerLogin, registerCommand, runCommand, type CommandsRegistry } from "./commander.js"
import { argv } from 'node:process';
import { assertExists } from "./utils.js";

const registry: CommandsRegistry = {};

registerCommand(registry, "login", handlerLogin);

function main() {
  const args = argv.slice(2);

  if (args.length < 1) {
    console.error("Not enough arguments were provided");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  assertExists(cmdName);

  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main()