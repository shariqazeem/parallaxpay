import { readFileSync } from 'fs';
import bs58 from 'bs58';

const keypair = JSON.parse(readFileSync('facilitator-keypair.json', 'utf-8'));
const privateKey = bs58.encode(Buffer.from(keypair));
console.log(privateKey);
