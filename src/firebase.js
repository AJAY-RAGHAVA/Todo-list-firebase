import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCqv12601vfmSqHXmiYijlkUZTFLp44r-0",
  authDomain: "todolist-c6150.firebaseapp.com",
  databaseURL: "https://todolist-c6150-default-rtdb.firebaseio.com",
  projectId: "todolist-c6150",
  storageBucket: "todolist-c6150.appspot.com",
  messagingSenderId: "99652260282",
  appId: "1:99652260282:web:eb612de02a2ffabcb5cd83",
  measurementId: "G-0DXWFKWZYV"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
