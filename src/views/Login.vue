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
        <label class="material-icons" for="username">email</label>
        <input
          v-model="username"
          type="text"
          id="username"
          name="username"
          required
          placeholder="Username"
        />
      </div>
      <div class="icon-input">
        <label class="material-icons" for="password">vpn_key</label>
        <input
          v-model="password"
          type="password"
          id="password"
          name="password"
          required
          placeholder="Password"
        />
      </div>
      <div class="icon-input">
        <label class="material-icons" for="gym-select">location_on</label>
        <select v-model="gym" id="gym-select" required>
          <option disabled value hidden>Select a gym</option>
          <option>Teagle</option>
          <option>Noyes</option>
          <option>Helen Newman</option>
          <option>Appel</option>
        </select>
        <span class="material-icons select-arrow">arrow_drop_down</span>
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
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase
      .auth()
      .signInWithEmailAndPassword(this.username, this.password)
      .then(() => {
        if (this.gym === "") {
          this.error = "Please select a gym.";
          return;
        }
        localStorage.gym = this.gym;
        this.$router.push({
          name: "home"
        });
      })
      .catch(error => {
        this.error = "Your username or password is incorrect.";
        return;
      });
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
  margin-left: -20px;
}

#error {
  text-align: left;
  margin-top: 20px;
  color: #fa4735;
}

#gym-select {
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
    padding: 10px 10px 10px 5px;
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
