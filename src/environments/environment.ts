import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: 'foodtruck-filestorage.firebasestorage.app',
  messagingSenderId: '',
  appId: '',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const environment = {
  production: false,
  CORS_ORIGINS: 'http://localhost:8100',
  BASE_URL: 'http://localhost:8081',
  PORT: '8081',
  FIREBASE_BUCKET_NAME: 'foodtruck-filestorage.firebasestorage.app',
  FIREBASE_SERVICE_ACCOUNT: 'file:./firebase-credentials.json',
} as const;

const storageRef = ref(storage, 'path/en/storage.jpg');
getDownloadURL(storageRef).then((url) => {});
