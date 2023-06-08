/**
 * Package imports
*/
import * as dotenv from 'dotenv'
import { Client, Environment } from 'square';

/**
 * Local file imports
*/

/**
 * Internal declarations
*/
dotenv.config();

const client = new Client({
    accessToken: process.env.SQ_ACCESS_TOKEN,
    environment: Environment.Sandbox,
});

export default client;
