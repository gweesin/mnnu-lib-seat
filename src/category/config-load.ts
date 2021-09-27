import * as fs from 'fs/promises';

const CONFIG_FILE_NAME = '../assets/app-config.json';

const file: Promise<string> = fs.readFile(CONFIG_FILE_NAME, 'utf-8');

export async function getUsers() {
    const json: string = JSON.parse(await file);
    return json['users'];
}
