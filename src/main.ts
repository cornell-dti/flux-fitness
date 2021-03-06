import "core-js/stable";
import "whatwg-fetch";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import * as firebase from "firebase/app";
import vuetify from "./plugins/vuetify";
import "./main.scss";

firebase.initializeApp({
  apiKey: "AIzaSyDeJl2Hp-cUQq2VPsEaRhLOz7TrVjeZHtQ",
  authDomain: "campus-density.firebaseapp.com",
  databaseURL: "https://campus-density.firebaseio.com",
  projectId: "campus-density",
  storageBucket: "campus-density.appspot.com",
  messagingSenderId: "833550952996",
});

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
