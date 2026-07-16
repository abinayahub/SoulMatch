import { buildPublicProfile } from './dist/lib/helpers.mjs';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
   try {
       const p = await buildPublicProfile(2, 1);
       console.log('Success:', !!p);
       process.exit(0);
   } catch (e) {
       console.error('Error:', e);
       process.exit(1);
   }
}
test();
