import Vue from "vue";
import App from "./App.vue";
import Notifications from "vue-notification";
import router from "./router";
import * as firebase from "firebase";

var firestuff = firebase.initializeApp({
  apiKey: "AIzaSyDeJl2Hp-cUQq2VPsEaRhLOz7TrVjeZHtQ",
  authDomain: "campus-density.firebaseapp.com",
  databaseURL: "https://campus-density.firebaseio.com",
  projectId: "campus-density",
  storageBucket: "campus-density.appspot.com",
  messagingSenderId: "833550952996"
});

var db = firebase.database();

import "./main.scss";

Vue.config.productionTip = false;

Vue.use(Notifications);

Vue.mixin({
  methods: {
    getFB() {
      return firebase;
    }
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
