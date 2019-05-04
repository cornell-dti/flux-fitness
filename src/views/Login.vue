<template>
  <app-card>
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
      <div class="icon-input">
        <i class="material-icons">email</i>
        <input v-model="username" type="text" name="username" required placeholder="Username">
      </div>
      <div class="icon-input">
        <i class="material-icons">vpn_key</i>
        <input v-model="password" type="password" name="password" required placeholder="Password">
      </div>
      <div class="icon-input">
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
    <action-button-group
      :require-confirmation="false"
      v-on:submitted="handler()"
      action-button-text="LOGIN"
    />
  </app-card>
</template>

<script lang="ts">
import * as firebase from "firebase";
import Component from "vue-class-component";
import AppCard from "@/components/AppCard.vue";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import Vue from "vue";

@Component({
  components: {
    ActionButtonGroup,
    AppCard
  }
})
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
          localStorage.gym = this.gym;
          this.$router.push({
            name: "home"
          });
        })
        .catch(error => {
          console.log(`Error: ${error.code} with message: ${error.message}`);
          this.error = "Please enter a valid login.";
        });
    } else {
      this.error = "Please select a gym.";
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

.material-icons {
  color: #000000;
  font-size: 20px;
  vertical-align: middle;
}

.select-arrow {
  margin-left: -15px;
}

#error {
  text-align: left;
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
    border-radius: 0;
    border-bottom: 1px solid black;
    max-width: 70%;
  }
}

[hidden] {
  display: none;
}
</style>
