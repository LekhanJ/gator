import { XMLParser } from "fast-xml-parser";
import { readConfig, setUser, type Config } from "./config.js";
import { createUser, getUser, getUsers } from "./lib/db/queries/users.js";
import { assertExists } from "./utils.js";
import { createFeed, getFeedByUrl } from "./lib/db/queries/feeds.js";
import type { Feed, User } from "./schema.js";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

type RSSFeed = {
	channel: {
		title: string;
		link: string;
		description: string;
		item: RSSItem[];
	};
};

type RSSItem = {
	title: string;
	link: string;
	description: string;
	pubDate: string;
};

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
	
	if (args.length !== 1)
		throw new Error("The login command expects a single argument, the username");

	const username = args[0];

	assertExists(username, "Username is missing");

	const result = await getUser(username);
	if (!result)
		throw new Error("User does not exists. Please register before logging in!");

	setUser(username);

	console.log("Login successful. User has been set");
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
	
	if (args.length !== 1)
		throw new Error("The register command expects a single argument, the username");

	const username = args[0];

	assertExists(username, "Username is missing");

	const result = await getUser(username);
	if (result)
		throw new Error("User already exists. Please login");

	const createdUser = await createUser(username);

	setUser(username);

	console.log(`User created: ${JSON.stringify(createdUser)}`);
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
	const users = await getUsers();
	const config = readConfig();
	users.forEach((user) => {
		if (user.name === config.currentUserName) 
			console.log(`${user.name} (current)`);
		else 
			console.log(user.name);
	});
}

export async function handlerAgg(cmdname: string, ...args: string[]): Promise<void> {
	const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
	console.dir(feed, { depth: null });
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
	if (args.length !== 2)
		throw new Error("The addfeed command expects two arguments, name of the feed and url");

	const name = args[0];
	const url = args[1];
	assertExists(name, "Name is missing");
	assertExists(url, "Url is missing");

	const feed = await createFeed(name, url, user.id);
	assertExists(feed, "Feed does not exist");

	const follow = await createFeedFollow(user.id, feed.id);
	assertExists(follow, "Following failed");

	console.log("Feed Added.");

	printFeed(feed, user);

	console.log(`${follow.userName} is now following ${follow.feedName}`);
}

export async function handlerFollow(cmdname: string, user: User, ...args: string[]): Promise<void> {
	if (args.length !== 1)
		throw new Error("The follow command expects a single argument, the feed url");

	const url = args[0];
	assertExists(url, "Url is missing");

	const feed = await getFeedByUrl(url);
	assertExists(feed, "Feed does not exist");

	await createFeedFollow(user.id, feed.id);

	console.log(`${user.name} Followed ${feed.name}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
	const result = await getFeedFollowsForUser(user.id);

	console.log("You are following these feeds: ");
	result.forEach((res) => {
		console.log(res.feedName)
	})
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
	
}

export function printFeed(feed: Feed, user: User): void {
	console.log("Feed:");
	console.log(`  id: ${feed.id}`);
	console.log(`  name: ${feed.name}`);
	console.log(`  url: ${feed.url}`);
	console.log(`  user: ${user.name}`);
}

async function fetchFeed(feedUrl: string): Promise<RSSFeed> {
	const response = await fetch(feedUrl, {
		headers: { "User-Agent": "gator" },
	});

	const xml = await response.text();

	const parser = new XMLParser({ processEntities: false });

	const parsed = parser.parse(xml);

	if (!parsed.rss?.channel)
		throw new Error("Invalid RSS feed");

	const channel = parsed.rss.channel;

	if (typeof channel.title !== "string" || typeof channel.link !== "string" || typeof channel.description !== "string")
		throw new Error("Invalid RSS metadata");

	let rawItems: unknown[] = [];

	if (Array.isArray(channel.item))
		rawItems = channel.item;
	else if (channel.item) 
		rawItems = [channel.item];

	const items: RSSItem[] = [];

	for (const item of rawItems) {
		if (typeof item !== "object" || item === null) 
			continue;

		const rssItem = item as Record<string, unknown>;

		if (typeof rssItem.title !== "string" || typeof rssItem.link !== "string" || typeof rssItem.description !== "string" || typeof rssItem.pubDate !== "string")
			continue;

		items.push({
			title: rssItem.title,
			link: rssItem.link,
			description: rssItem.description,
			pubDate: rssItem.pubDate,
		});
	}

	return {
		channel: {
			title: channel.title,
			link: channel.link,
			description: channel.description,
			item: items,
		}
	};
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
  	registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
	const handler = registry[cmdName];
	assertExists(handler, `Command ${cmdName} does not exist`);
	await handler(cmdName, ...args);
}
