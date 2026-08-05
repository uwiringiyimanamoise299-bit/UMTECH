import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAe-XZvq4jMUSSgt-5HqsY9udGl7DqQ_b0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'umtech-fb1cc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'umtech-fb1cc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'umtech-fb1cc.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '730459113523',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:730459113523:web:0eac9f400575f1bbb9fb46',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-JXSQ90TB37',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

function loadJson(file) {
  return JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
}

const collectionMapping = {
  'admins.json': { collection: 'admins', idField: 'uid' },
  'users.json': { collection: 'users', idField: 'uid' },
  'messages.json': { collection: 'messages', idField: 'id' },
  'posts.json': { collection: 'posts', idField: 'id' },
  'projects.json': { collection: 'projects', idField: 'id' },
  'post-comments.json': { collection: 'post-comments', idField: 'id' },
  'project-comments.json': { collection: 'project-comments', idField: 'id' },
  'service-requests.json': { collection: 'service-requests', idField: 'id' },
};

const singleDocMapping = {
  'posts-likes.json': { collection: 'posts-likes', id: 'data' },
  'projects-likes.json': { collection: 'projects-likes', id: 'data' },
  'profile.json': { collection: 'config', id: 'profile' },
  'settings.json': { collection: 'config', id: 'settings' },
  'visitors.json': { collection: 'config', id: 'visitors' },
};

const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));

async function main() {
  let written = 0;

  for (const file of files) {
    const cfg = collectionMapping[file];
    if (cfg) {
      const data = loadJson(file);
      if (!Array.isArray(data)) {
        console.warn(`Skipping ${file}: expected an array, got ${typeof data}`);
        continue;
      }
      for (const item of data) {
        const id = item[cfg.idField];
        if (!id) {
          console.warn(`Skipping entry in ${file}: missing id field "${cfg.idField}"`);
          continue;
        }
        await setDoc(doc(db, cfg.collection, id), item);
        written += 1;
      }
      console.log(`Seeded ${file} -> ${cfg.collection} (${data.length} docs)`);
      continue;
    }

    const single = singleDocMapping[file];
    if (single) {
      const data = loadJson(file);
      await setDoc(doc(db, single.collection, single.id), data);
      written += 1;
      console.log(`Seeded ${file} -> ${single.collection}/${single.id}`);
    }
  }

  console.log(`\nDone. ${written} document(s) written to project "${firebaseConfig.projectId}".`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
