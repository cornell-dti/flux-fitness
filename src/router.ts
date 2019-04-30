import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Settings from "./views/Settings.vue";

Vue.use(Router);

import * as firebase from "firebase";
export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            console.log("user is indeed signed in"); //get rid of this
            next();
          } else {
            next("/login");
          }
        });
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      beforeEnter(to, from, next) {
        if (from.name == "home") {
          next();
        } else {
          next("/");
        }
      }
    }
  ]
});
