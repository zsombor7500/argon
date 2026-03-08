import bcrypt from 'bcrypt';

import { apiConfig } from '#/configs/api';


export async function hashText(text: string): Promise<string> {
    return await bcrypt.hash(text, apiConfig.saltRounds);
}

export async function verifyText(text: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(text, hash);
}
