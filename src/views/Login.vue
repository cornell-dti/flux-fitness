<template>
  <div class="full">
    <div class="login middle">
      <div class="text">
        <h1>Flux Fitness</h1>
        <p>
          A simple webapp by the
          <a href="https://www.cornelldti.org/" target="_blank">DTI</a> Flux team
          to track people in gyms.
        </p>
        <p>Please log in with the username and password provided by DTI.</p>
      </div>
      <form class="login-form">
        <div class="input">
          <i class="material-icons">email</i>
          <input v-model="username" type="text" name="username" required placeholder="Username">
        </div>
        <div class="input">
          <i class="material-icons">vpn_key</i>
          <input v-model="password" type="password" name="password" required placeholder="Password">
        </div>
        <div class="input">
          <i class="material-icons">location_on</i>
          <select class="gym-select" v-model="gym" required>
            <option disabled value hidden>Select a gym</option>
            <option>Teagle</option>
            <option>Noyes</option>
            <option>Helen Newman</option>
            <option>Appel</option>
          </select>
          <i class="material-icons select-arrow">arrow_drop_down</i>
        </div>
      </form>
      <div id="error">{{error}}</div>
      <div class="button-group">
        <button class="action-button" v-on:click="handler">LOGIN</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as firebase from "firebase";
import Component from "vue-class-component";
import Vue from "vue";

@Component
export default class Login extends Vue {
  username = "";
  password = "";
  gym = "";
  error = "";
  handler() {
    console.log("processing username and password");
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    if (this.gym != "") {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.username, this.password)
        .then(() => {
          console.log("success");
          this.$router.push({
            name: "home",
            params: { gym: this.gym }
          });
        })
        .catch(error => {
          console.log(`Error: ${error.code} with message: ${error.message}`);
          this.error = "Please enter a valid login";
        });
    } else {
      this.error = "Please select a gym";
    }
  }
}
</script>

<style lang="scss" scoped>
h1 {
  font-weight: bold;
}

.login-form {
  margin-top: 20px;
  text-align: left;
}

.text {
  padding-right: 30px;
}

.button-group {
  height: 50px;
  width: 100%;
  text-align: right;
}

.action-button {
  margin-right: 20px;
}

.material-icons {
  color: #000;
  font-size: 20px;
  vertical-align: middle;
}

.select-arrow {
  margin-left: -15px;
}

#error {
  text-align: center;
  margin-top: 20px;
  color: #fa4735;
}

.gym-select {
  &:invalid,
  option[value=""] {
    color: #767676;
  }

  &,
  option {
    color: black;
    appearance: none;
    -webkit-appearance: none;
    margin-inline-start: 5%;
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    padding: 10px 10px 10px 0px;
    border: none;
    border-bottom: 1px solid black;
    max-width: 70%;
  }
}

[hidden] {
  display: none;
}
</style>
