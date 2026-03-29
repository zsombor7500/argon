import crypto from 'crypto';

import bcrypt from 'bcrypt';

import { apiConfig } from '#/configs/api';


export async function getBcryptHash(text: string, saltRounds: number = apiConfig.saltRounds): Promise<string> {
    return await bcrypt.hash(text, saltRounds);
}

export async function verifyBcryptHash(text: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(text, hash);
}

export function getSha512Hash(text: string): string {
    return crypto
        .createHash('sha512')
        .update(text)
        .digest('hex');
}

export function verifySha512Hash(text: string, hash: string): boolean {
    return hash === getSha512Hash(text);
}
