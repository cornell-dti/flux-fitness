<template>
  <v-container>
    <v-row>
      <v-col xs="12" sm="8" lg="6" xl="4" class="px-8 py-3 mx-auto">
        <top-actions @logout="signOut" @export="goExport" @help="goHelp" />
        <h1 class="mt-5 mb-2">{{ gym }}</h1>
        <v-form lazy-validation>
          <v-row>
            <v-col cols="3" class="mt-3">
              <h2>Weights</h2>
            </v-col>
            <v-col>
              <v-text-field
                v-model="powerRacks"
                label="Power Racks"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
              <v-text-field
                v-model="benchPress"
                label="Bench Press"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
              <v-text-field
                v-model="dumbbells"
                label="Dumbbells"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3" class="mt-3">
              <h2>Cardio</h2>
            </v-col>
            <v-col>
              <v-text-field
                v-model="treadmills"
                label="Treadmills"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
              <v-text-field
                v-model="ellipticals"
                label="Ellipticals"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
              <v-text-field
                v-model="bikes"
                label="Bikes"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
              <v-text-field
                v-model="amts"
                label="AMTs"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :counter="inputCharLimit"
                clearable
              />
            </v-col>
          </v-row>
        </v-form>
        <div id="error">{{ error }}</div>
        <v-row class="justify-end">
          <v-btn color="blue" outlined @click="submit()">Submit</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import * as firebase from "firebase/app";
import "firebase/firestore";
import Component from "vue-class-component";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import AppCard from "@/components/AppCard.vue";
import VueSimpleAlert from "vue-simple-alert";
import TopActions from "@/components/TopActions.vue";
import GymLimits from "@/data/GymLimits";

Vue.use(VueSimpleAlert);

@Component({
  components: {
    ActionButtonGroup,
    AppCard,
    TopActions
  }
})
export default class Home extends Vue {
  powerRacks = "";
  benchPress = "";
  dumbbells = "";

  treadmills = "";
  ellipticals = "";
  bikes = "";
  amts = "";

  inputCharLimit = 3;

  rules = [
    (v: any) => !!v || "This field is required",
    (v: any) =>
      (v && v.length <= this.inputCharLimit) ||
      "Input is over the character limit",
    (v: any) => (v && /^([0-9]*)$/.test(v)) || "Please input a number",
    (v: any) => (v && /^(0|[1-9][0-9]*)$/.test(v)) || "No leading zeros"
  ];

  time = new Date();
  weights = "";
  cardio = "";
  gym = "";

  limits = GymLimits;
  confirm = "";
  error = "";

  /**
   * Called when component is mounted (see Vue lifecycle hooks).
   * This allows for persistence of selected gym across refresh using local
   * storage and navigates to login if none is found.
   */
  mounted() {
    if (localStorage.gym) {
      this.gym = localStorage.gym;
    } else {
      this.$router.push({ name: "login" });
    }
  }

  /**
   * Navigates to the export page
   */
  goExport() {
    this.$router.push({
      name: "export"
    });
  }

  /**
   * Navigates to help navigation (external link to Google Docs)
   */
  goHelp() {
    window.open(
      "https://docs.google.com/document/d/1nFARd_tRBTzdi7-BhkwmLKih-34G4zsHB-DZk-mx4KA/edit"
    );
  }

  /**
   * Attempts to submit data to Firebase
   */
  submit() {
    this.error = "";
    let weightsNum = Number.parseInt(this.weights);
    let cardioNum = Number.parseInt(this.cardio);
    let notInt =
      weightsNum !== Number.parseFloat(this.weights) ||
      cardioNum !== Number.parseFloat(this.cardio);
    if (!this.weights || !this.cardio) {
      this.error = "Please verify your data.";
      return;
    }
    if (weightsNum < 0 || cardioNum < 0) {
      this.error = "Numbers must be nonnegative.";
      return;
    }
    if (notInt) {
      this.error = "Numbers must be integers.";
      return;
    }
    let gymLimits = this.limits[this.gym];
    if (cardioNum > gymLimits.cardio) {
      this.error = `${this.gym} does not have space for ${cardioNum} cardio.`;
      return;
    }
    if (weightsNum > gymLimits.other) {
      this.error = `${this.gym} does not have space for ${weightsNum} weights.`;
      return;
    }
    const time = new Date();
    time.setMilliseconds(Math.round(time.getMilliseconds() / 1000) * 1000);
    time.setSeconds(Math.round(time.getSeconds() / 60) * 60);
    time.setMinutes(Math.round(time.getMinutes() / 15) * 15);
    const roundedTime = time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "America/New_York"
    });
    this.time = time;
    this.confirm =
      this.gym +
      " at " +
      roundedTime +
      ": there's " +
      this.cardio +
      (this.cardio === "1" ? " person" : " people") +
      " using cardio machines and " +
      this.weights +
      (this.weights === "1" ? " person" : " people") +
      " using weights.";
    this.$confirm(this.confirm, "Confirm").then(() => {
      this.handler();
    });
  }

  handler() {
    if (this.weights && this.cardio) {
      var db = firebase.firestore();
      let current_gym = this.gym.toLowerCase();
      db.collection("gymdata")
        .doc(current_gym)
        .collection("counts")
        .add({
          cardio: Number.parseInt(this.cardio),
          weights: Number.parseInt(this.weights),
          time: this.time
        })
        .then(() => {
          this.confirm = "";
          this.weights = "";
          this.cardio = "";
          this.$notify({
            group: "default_group",
            type: "success",
            duration: 2500,
            title: "Success",
            text: "The data you entered went through!"
          });
        })
        .catch(() => {
          this.error = "There was an error in adding the document.";
          return;
        });
      this.weights = "";
      this.cardio = "";
      this.confirm = "";
    } else {
      this.error = "Please enter a value";
      return;
    }
  }

  signOut() {
    localStorage.clear();
    firebase
      .auth()
      .signOut()
      .then(() => {
        // logged out
        this.$router.push({ name: "login" });
      });
  }
}
</script>
