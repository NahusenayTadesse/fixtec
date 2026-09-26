import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

/** A variable from the environment or `.env`, since Playwright doesn't load it on its own. */
export function envVar(name: string) {
	if (process.env[name]) return process.env[name]!;
	const line = readFileSync('.env', 'utf8')
		.split('\n')
		.find((l) => l.includes('=') && l.split('=')[0].trim() === name);
	if (!line) throw new Error(`${name} is not set`);
	return line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
}

const databaseUrl = () => envVar('DATABASE_URL');

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []) {
	const conn = await mysql.createConnection(databaseUrl());
	try {
		const [rows] = await conn.query(sql, params);
		return rows as T[];
	} finally {
		await conn.end();
	}
}
