import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { build, createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
const root = process.cwd();
const staging = path.join(root, '.pages-build');
const output = path.join(root, 'pages-dist');
const base = process.env.PAGES_BASE_PATH || '/others/';
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('PAGES_BASE_PATH must start and end with /');
const endpoint = process.env.WAITLIST_ENDPOINT || '';
if (endpoint && new URL(endpoint).protocol !== 'https:') throw new Error('WAITLIST_ENDPOINT must be HTTPS');
await mkdir(staging, {recursive:true});
let source = await readFile('app/page.tsx','utf8');
source = source.replaceAll('/images/', `${base}images/`)
 .replace("const formData=new FormData(e.currentTarget);", `if (!${JSON.stringify(endpoint)}) { setStatus('error'); setMessage('Waitlist signup is not available on this site yet. Please check back soon.'); return; } const formData=new FormData(e.currentTarget);`)
 .replace("fetch('/api/waitlist'", `fetch(${JSON.stringify(endpoint)}`);
if (!endpoint) source = source.replace('Only updates about Others. No spam. No sharing your email.', 'Waitlist signup is not connected yet. No email will be stored.');
await writeFile(path.join(staging,'Home.tsx'),source);
await writeFile(path.join(staging,'style.css'),(await readFile('app/globals.css','utf8')).replaceAll('/images/',`${base}images/`));
await writeFile(path.join(staging,'main.tsx'), `import React from 'react'; import {hydrateRoot} from 'react-dom/client'; import Home from './Home'; import './style.css'; hydrateRoot(document.getElementById('root')!, <Home/>);`);
const server=await createServer({configFile:false,root:staging,plugins:[react()],server:{middlewareMode:true,hmr:false},appType:'custom'});
let html;
try { const {default:Home}=await server.ssrLoadModule('/Home.tsx'); html=renderToString(createElement(Home)); } finally {await server.close();}
await writeFile(path.join(staging,'index.html'),`<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Others — Somewhere, there’s another you.</title><meta name="description" content="Same beginnings. Different decisions. A whole other life. Meet your alternate self."/><meta property="og:title" content="Others — Somewhere, there’s another you."/><meta property="og:image" content="${base}images/identities-v2.jpg"/><link rel="icon" href="${base}favicon.svg"/></head><body><div id="root">${html}</div><script type="module" src="/main.tsx"></script></body></html>`);
await build({configFile:false,root:staging,base,plugins:[react()],build:{outDir:output,emptyOutDir:true}});
await cp(path.join(root,'public/images'),path.join(output,'images'),{recursive:true});
await cp(path.join(root,'public/favicon.svg'),path.join(output,'favicon.svg'));
await writeFile(path.join(output,'.nojekyll'),'');
console.log(`GitHub Pages build ready: ${output}`);
