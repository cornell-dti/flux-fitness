<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Flux Fitness</h1>
        <p>
          A simple webapp by the
          <a href="https://www.cornelldti.org/" target="_blank">DTI</a> Flux team
          to track people in gyms.
        </p>
        <p>Please log in with the username and password provided by DTI.</p>
      </v-col>
    </v-row>
    <v-form>
      <v-text-field v-model="username" label="Username" prepend-icon="email" />
      <v-text-field v-model="password" label="Password" prepend-icon="vpn_key" />
      <v-select v-model="gym" :items="gyms" label="Select a gym" prepend-icon="location_on" />
      <div class="red--text py-2">{{error}}</div>
      <v-btn color="blue" outlined @click="handler()">Login</v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as firebase from "firebase/app";
import "firebase/auth";
import Gyms from "@/data/Gyms";
import AppCard from "@/components/AppCard.vue";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";

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

  gyms = Gyms.map(gymData => gymData.name);

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
      .catch(() => {
        this.error = "Your username or password is incorrect.";
        return;
      });
  }
}
</script>
