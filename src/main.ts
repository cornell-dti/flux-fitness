import Vue from 'vue'
import App from './App.vue'
import router from './router'
import * as firebase from 'firebase'
var firestuff = firebase.initializeApp({
  apiKey: "AIzaSyD4bbvkRs0ywgjB7WzVh8PSvKZfPfzOum4",
  authDomain: "testing-gym-data.firebaseapp.com",
  databaseURL: "https://testing-gym-data.firebaseio.com",
  projectId: "testing-gym-data",
  storageBucket: "testing-gym-data.appspot.com",
  messagingSenderId: "704595972825"
});
var db = firebase.database()

Vue.config.productionTip = false

Vue.mixin({
  methods: {
    getFB() {
      return firebase
    }
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
