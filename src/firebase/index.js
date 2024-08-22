import firebaseConfig from './config'
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)
const auth = getAuth(app)
const firestore = getFirestore(app)

export { storage, auth, firestore }
