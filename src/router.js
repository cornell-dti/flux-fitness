import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

Vue.use(Router)

import * as firebase from 'firebase'
export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter(to, from, next) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            console.log("user is indeed signed in") //get rid of this
            next()
          }
          else {
            next("/login")
          }
        })
      
      }
    },
    {
      path: '/login',
      name: 'Log In Page',
      component: About
    }
  ]
})
