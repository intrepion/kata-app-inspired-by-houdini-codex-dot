import {cp,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
for(const item of ['index.html','styles.css','favicon.svg','src','app.json','LICENSE'])await cp(path.join(root,item),path.join(root,'dist',item),{recursive:true});
console.log('Built dependency-free static app in dist/');
