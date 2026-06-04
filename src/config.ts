import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
	dbUrl: string;
	currentUserName?: string;
};

function getConfigFilePath(): string {
	return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
	const rawConfig = {
		db_url: cfg.dbUrl,
		current_user_name: cfg.currentUserName,
	};

	fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2));
}

function validateConfig(rawConfig: any): Config {
	if (!rawConfig.db_url)
		throw new Error("Missing db_url in config file");

	return {
		dbUrl: rawConfig.db_url,
		currentUserName: rawConfig.current_user_name,
	};
}

export function readConfig(): Config {
	const raw = fs.readFileSync(getConfigFilePath(), { encoding: "utf-8" });
	const parsed = JSON.parse(raw);
	return validateConfig(parsed);
}

export function setUser(userName: string): void {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}
