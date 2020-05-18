<template>
  <v-container class="fill-height no-overflow" fluid>
    <v-row>
      <v-col cols="12" class="px-8 py-8 mx-auto login-form">
        <h1>Flux Fitness</h1>
        <p>
          A simple webapp by the
          <a href="https://www.cornelldti.org/" target="_blank">DTI</a> Flux
          team to track people in gyms.
        </p>
        <p>Please log in with the username and password provided by DTI.</p>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="email"
            label="Email"
            prepend-icon="email"
            :rules="emailRules"
            aria-required
          />
          <v-text-field
            v-model="password"
            label="Password"
            prepend-icon="vpn_key"
            type="password"
            :rules="required"
            aria-required
          />
          <v-select
            v-model="gym"
            :items="gyms"
            :rules="required"
            label="Select a gym"
            prepend-icon="location_on"
            aria-required
          />
          <p class="red--text py-2 text-right">{{ error }}</p>
          <v-btn
            class="float-right"
            :disabled="!valid"
            color="blue"
            outlined
            @click="signIn()"
          >
            Login
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as firebase from "firebase/app";
import "firebase/auth";
import Gyms from "@/data/Gyms";

@Component
export default class Login extends Vue {
  email = "";
  password = "";
  gym = "";
  error = "";

  valid = true;
  readonly emailRules = [
    (v: any) => !!v || "Email is required",
    (v: any) => /.+@.+\..+/.test(v) || "Email must be valid",
  ];
  readonly required = [(v: any) => !!v || "This is required"];

  // TODO: make this list come from the backend
  readonly gyms = Gyms.map((gymData) => gymData.name);

  /**
   * Ref for the form component
   */
  get form(): any {
    return this.$refs.form;
  }

  /**
   * Validates and attempts to sign in with given credentials.
   */
  signIn() {
    if (!this.valid || !this.form.validate()) {
      this.error = "Please check your inputs.";
      return;
    }
    if (this.gym === "") {
      this.error = "Please select a gym.";
      return;
    }
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        // TODO: need a better system for storing ids
        const gymData = Gyms.find((gym) => gym.name === this.gym)!;
        localStorage.gymId = gymData.id;
        localStorage.gymName = gymData.name;
        this.$router.push({
          name: "home",
        });
      })
      .catch(() => {
        this.error = "Your username or password is invalid.";
        return;
      });
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  max-width: 600px;
}
</style>
