<template>
  <v-container class="fill-height" fluid>
    <v-row class="justify-sm-end">
      <v-col cols="12" sm="8" md="5">
        <v-row class="justify-center justify-sm-end">
          <top-actions @logout="signOut" @export="goExport" @help="goHelp" />
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="10" sm="6" lg="4" xl="3" class="px-8 py-3 mx-auto">
        <h1 class="mb-2">{{ gym }}</h1>

        <span class="d-inline-flex align-center mt-3">
          <v-icon color="black" left>today</v-icon>
          <h4 class="font-weight-regular pl-1">
            {{ time.toDateString() }}
          </h4>
        </span>
        <v-text-field
          class="pt-0 mt-0"
          v-model="timeSelect"
          type="time"
          @input="stopInterval()"
        >
          <div class="h-36px d-flex align-center" slot="prepend">
            <v-icon color="black">
              schedule
            </v-icon>
          </div>
          <v-tooltip slot="append" bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon :disabled="!timeEditted" @click="startInterval()">
                <v-icon v-on="on">restore</v-icon>
              </v-btn>
            </template>
            <span>
              Reset time to the current time
            </span>
          </v-tooltip>
          <v-tooltip v-model="timeHelp" slot="append-outer" bottom small>
            <template v-slot:activator="{}">
              <v-btn icon @click="timeHelp = !timeHelp">
                <v-icon>help</v-icon>
              </v-btn>
            </template>
            <span>
              The time that will be submitted with the gym counts
            </span>
          </v-tooltip>
        </v-text-field>

        <p class="pt-3">
          Please enter the number of people using the following equipment.
        </p>

        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12" sm="6">
              <h2>Weights</h2>
              <p v-if="!!weights"><b>Total:</b> {{ weights }}</p>
            </v-col>
            <v-col class="pt-0">
              <v-text-field
                v-model="powerRacks"
                label="Power Racks"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="benchPress"
                label="Bench Press"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="dumbbells"
                label="Dumbbells"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="other"
                label="Other"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              >
                <v-tooltip v-model="otherHelp" slot="append-outer" bottom>
                  <template v-slot:activator="{}">
                    <v-btn icon small @click="otherHelp = !otherHelp">
                      <v-icon>help</v-icon>
                    </v-btn>
                  </template>
                  <span>
                    "Other" includes mats and other weight machines not included
                    above
                  </span>
                </v-tooltip>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <h2>Cardio</h2>
              <p v-if="!!cardio"><b>Total:</b> {{ cardio }}</p>
            </v-col>
            <v-col class="pt-0">
              <v-text-field
                v-model="treadmills"
                label="Treadmills"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="ellipticals"
                label="Ellipticals"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="bikes"
                label="Bikes"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
              <v-text-field
                v-model="amts"
                label="AMTs"
                required
                :rules="rules"
                :maxlength="inputCharLimit"
                :clearable="clearable"
              />
            </v-col>
          </v-row>

          <v-row v-if="!!gymTotal">
            <v-col>
              <h2 class="gym-total"><b>Gym Total: </b>{{ gymTotal }}</h2>
            </v-col>
          </v-row>

          <v-col>
            <v-row class="justify-end mt-2 red--text">{{ error }}</v-row>
            <v-row class="justify-end pt-2">
              <v-btn class="mr-2" text @click="clearInputs()">Clear All</v-btn>
              <v-btn
                color="blue"
                outlined
                :disabled="!valid"
                @click="validate()"
              >
                Submit
              </v-btn>
            </v-row>
          </v-col>
        </v-form>

        <confirm-dialog v-model="dialog" :confirm="confirm" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import Component from "vue-class-component";
import TopActions from "@/components/Home/TopActions.vue";
import ConfirmDialog from "@/components/Home/ConfirmDialog.vue";
import GymLimits from "@/data/GymLimits";

@Component({
  components: {
    TopActions,
    ConfirmDialog
  }
})
export default class Home extends Vue {
  powerRacks = "";
  benchPress = "";
  dumbbells = "";
  other = "";

  treadmills = "";
  ellipticals = "";
  bikes = "";
  amts = "";

  valid = true;
  readonly inputCharLimit = 3;
  readonly rules = [
    (v: any) => !!v || "This field is required",
    (v: any) =>
      (v && v.length <= this.inputCharLimit) ||
      "Input is over the character limit",
    (v: any) => (v && /^([0-9]*)$/.test(v)) || "Please input a number",
    (v: any) => (v && /^(0|[1-9][0-9]*)$/.test(v)) || "No leading zeros"
  ];
  readonly clearable = false;

  otherHelp = false;

  time = new Date();
  timeSelect = this.time.toTimeString().substring(0, 8);
  timeInterval: any = null;
  timeEditted = false;
  timeHelp = false;

  gym = "";
  readonly limits = GymLimits;

  dialog = false;
  confirm = "";
  error = "";

  get weights(): string {
    const prNum = Number.parseInt(this.powerRacks);
    const bpNum = Number.parseInt(this.benchPress);
    const dbNum = Number.parseInt(this.dumbbells);
    const otNum = Number.parseInt(this.other);
    if (isNaN(prNum) || isNaN(bpNum) || isNaN(dbNum) || isNaN(otNum)) return "";
    return (prNum + bpNum + dbNum + otNum).toString();
  }

  get cardio(): string {
    const tmNum = Number.parseInt(this.treadmills);
    const elNum = Number.parseInt(this.ellipticals);
    const bkNum = Number.parseInt(this.bikes);
    const amNum = Number.parseInt(this.amts);
    if (isNaN(tmNum) || isNaN(elNum) || isNaN(bkNum) || isNaN(amNum)) return "";
    return (tmNum + elNum + bkNum + amNum).toString();
  }

  get gymTotal(): string {
    const weightsNum = Number.parseInt(this.weights);
    const cardioNum = Number.parseInt(this.cardio);
    if (isNaN(weightsNum) || isNaN(cardioNum)) return "";
    this.error = "";
    return (weightsNum + cardioNum).toString();
  }

  get form(): any {
    return this.$refs.form as any;
  }

  /**
   * Called when component is mounted (see Vue lifecycle hooks).
   *
   * This allows for persistence of selected gym across refresh using local
   * storage and navigates to login if none is found.
   *
   * Also, starts the time interval
   */
  mounted() {
    if (localStorage.gym) {
      this.gym = localStorage.gym;
      this.startInterval(1000);
    } else {
      this.$router.push({ name: "login" });
    }
  }

  /**
   * Starts time interval that refreshes the time at a given interval
   */
  startInterval(interval: number) {
    this.timeEditted = false;
    this.timeInterval = setInterval(() => {
      this.timeSelect = new Date().toTimeString().substring(0, 8);
    }, interval);
  }

  /**
   * Stops time interval
   */
  stopInterval() {
    this.timeEditted = true;
    clearInterval(this.timeInterval);
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
   * Clears user inputs
   */
  clearInputs() {
    this.error = "";
    this.form.reset();
  }

  /**
   * Validates data and opens confirmation dialog
   */
  validate() {
    this.form.validate();
    this.error = "";
    if (!this.weights || !this.cardio) {
      this.error = "Please verify your data.";
      return;
    }
    const weightsNum = Number.parseInt(this.weights);
    const cardioNum = Number.parseInt(this.cardio);

    const gymLimits = this.limits[this.gym];
    if (cardioNum > gymLimits.cardio) {
      this.error = `${this.gym} does not have space for ${cardioNum} cardio.`;
      return;
    }
    if (weightsNum > gymLimits.other) {
      this.error = `${this.gym} does not have space for ${weightsNum} weights.`;
      return;
    }

    // TODO: if we have time input, just show the time that they have selected (or current time)
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

    this.confirm = `${this.gym} at ${roundedTime}: there's ${this.cardio} ${
      this.cardio === "1" ? " person" : " people"
    } using cardio machines and ${this.weights} ${
      this.weights === "1" ? " person" : " people"
    } using weights.`;

    this.dialog = true;
  }

  /**
   * Submits data to Firebase
   */
  submit() {
    if (this.weights && this.cardio) {
      const db = firebase.firestore();
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
          // TODO: change this to not use Vue notify
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
      this.confirm = "";
    } else {
      this.error = "Please enter a value";
      return;
    }
  }

  /**
   * Signs user out and routes back to login screen
   */
  signOut() {
    localStorage.clear();
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.$router.push({ name: "login" });
      });
  }
}
</script>

<style lang="scss" scoped>
.gym-total {
  font-weight: normal;
}

.h-36px {
  height: 36px;
}
</style>
