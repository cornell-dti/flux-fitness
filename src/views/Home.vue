<template>
  <v-container>
    <v-row>
      <v-col xs="12" sm="8" lg="6" xl="4" class="px-8 py-3 mx-auto">
        <top-actions @logout="signOut" @export="goExport" @help="goHelp" />
        <h1 class="mt-5 mb-2">{{ gym }}</h1>
        <v-form lazy-validation>
          <v-row>
            <v-col cols="3" class="mt-4">
              <h2>Weights</h2>
            </v-col>
            <v-col>
              <v-text-field v-model="powerRacks" label="Power Racks" required :rules="rules" />
              <v-text-field v-model="benchPress" label="Bench Press" required :rules="rules" />
              <v-text-field v-model="dumbbells" label="Dumbbells" required :rules="rules" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3" class="mt-4">
              <h2>Cardio</h2>
            </v-col>
            <v-col>
              <v-text-field v-model="treadmills" label="Treadmills" required :rules="rules" />
              <v-text-field v-model="ellipticals" label="Ellipticals" required :rules="rules" />
              <v-text-field v-model="bikes" label="Bikes" required :rules="rules" />
              <v-text-field v-model="amts" label="AMTs" required :rules="rules" />
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

  rules = [
    (v: any) => !!v || "This field is required",
    (v: any) =>
      (v && v.length <= 5 && /^[1-9][0-9]*$/.test(v)) || "Please input a number"
  ];

  time = new Date();
  weights = "";
  cardio = "";
  gym = "";
  limits: any = {
    Teagle: {
      cardio: 42,
      other: 86
    },
    Noyes: {
      cardio: 32,
      other: 40
    },
    "Helen Newman": {
      cardio: 35,
      other: 51
    },
    Appel: {
      cardio: 20,
      other: 40
    }
  };
  confirm = "";
  error = "";

  // creates persistence across refresh
  mounted() {
    if (localStorage.gym) {
      this.gym = localStorage.gym;
    }
  }

  goExport() {
    this.$router.push({
      name: "export"
    });
  }

  goHelp() {
    window.open(
      "https://docs.google.com/document/d/1nFARd_tRBTzdi7-BhkwmLKih-34G4zsHB-DZk-mx4KA/edit"
    );
  }

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
