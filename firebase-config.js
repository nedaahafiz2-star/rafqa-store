// firebase-config.js — إعدادات مشروع Rafqa
const firebaseConfig = {
  apiKey: "AIzaSyAOh6ErRrBuwe1xea2dOoFCDTnXXip4jE8",
  authDomain: "rafqa-bc5f4.firebaseapp.com",
  databaseURL: "https://rafqa-bc5f4-default-rtdb.firebaseio.com",
  projectId: "rafqa-bc5f4",
  storageBucket: "rafqa-bc5f4.firebasestorage.app",
  messagingSenderId: "61389145699",
  appId: "1:61389146599:web:61bbadf915bf2dbe7e9a56",
  measurementId: "G-S8CG0BGJNX"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// تعريف المتغيرات عالمياً — أضفنا storage
window.db      = firebase.firestore();
window.rtdb    = firebase.database();
window.auth    = firebase.auth();
window.storage = firebase.storage();   // ← مهم لرفع الصور