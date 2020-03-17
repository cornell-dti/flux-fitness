import Vue from "vue";
import App from "./App.vue";
import Notifications from "vue-notification";
import router from "./router";
import * as firebase from "firebase";
import vuetify from "./plugins/vuetify";
import "./main.scss";

firebase.initializeApp({
  apiKey: "AIzaSyDeJl2Hp-cUQq2VPsEaRhLOz7TrVjeZHtQ",
  authDomain: "campus-density.firebaseapp.com",
  databaseURL: "https://campus-density.firebaseio.com",
  projectId: "campus-density",
  storageBucket: "campus-density.appspot.com",
  messagingSenderId: "833550952996"
});

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
  vuetify,
  render: h => h(App)
}).$mount("#app");
