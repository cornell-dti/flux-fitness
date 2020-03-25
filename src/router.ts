import Vue from "vue";
import * as firebase from "firebase/app";
import "firebase/auth";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Export from "./views/Export.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
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
      component: Login,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            next("/");
          } else {
            next();
          }
        });
      }
    },
    {
      path: "/export",
      name: "export",
      component: Export,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            next();
          } else {
            next("/login");
          }
        });
        if (from.name == "home") {
          next();
        } else {
          next("/");
        }
      }
    }
  ]
});
