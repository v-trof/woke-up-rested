// to recive pushes

importScripts('https://www.gstatic.com/firebasejs/8.1.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.1.2/firebase-messaging.js');

firebase.initializeApp({
    apiKey: 'AIzaSyB6cPOZ9JLUFpd13LNU878GoQOltzUUAMk',
    authDomain: 'woke-up-rested.firebaseapp.com',
    projectId: 'woke-up-rested',
    storageBucket: 'woke-up-rested.appspot.com',
    messagingSenderId: '558131846902',
    appId: '1:558131846902:web:abc839cb50476d730116d7',
});

firebase.messaging();
