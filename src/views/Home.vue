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
      <v-col cols="12" sm="8" lg="5" xl="3" class="px-8 py-3 mx-auto">
        <h1 class="mb-2">{{ gymName }}</h1>

        <span class="d-inline-flex align-center mt-3">
          <v-icon color="black" left>today</v-icon>
          <h4 class="font-weight-regular pl-1">{{ getDate() }}</h4>
        </span>

        <v-form ref="timeForm" v-model="timeValid">
          <time-text-field
            :value="getTime()"
            :reset-disabled="!timeEditted"
            :seconds="dateTime.getSeconds()"
            @input="
              stopInterval();
              setTime($event);
            "
            @reset="startInterval"
          />
        </v-form>

        <v-form ref="form" v-model="valid" lazy-validation>
          <p class="pt-3">
            Please enter the number of people using the following equipment.
          </p>

          <v-row>
            <v-col cols="12" sm="6">
              <h2>Cardio</h2>
              <p v-if="!!cardio">
                <b>Total:</b>
                {{ cardio }}
              </p>
            </v-col>
            <v-col class="pt-0">
              <count-text-field
                v-for="field in cardioFields"
                v-model="field.count"
                :key="field.key"
                :field="field"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <h2>Weights</h2>
              <p v-if="!!weights">
                <b>Total:</b>
                {{ weights }}
              </p>
            </v-col>
            <v-col class="pt-0">
              <count-text-field
                v-for="field in weightFields"
                v-model="field.count"
                :key="field.key"
                :field="field"
              />
            </v-col>
          </v-row>

          <v-row v-if="!!gymTotal">
            <v-col>
              <h2 class="font-weight-regular">
                <b>Gym Total:</b>
                {{ gymTotal }}
              </h2>
            </v-col>
          </v-row>

          <p class="text-right mt-2 red--text">{{ error }}</p>
          <div class="float-right pt-2">
            <v-btn class="mr-2" text @click="clearInputs()">Clear All</v-btn>
            <v-btn
              color="blue"
              outlined
              :disabled="!valid || !timeValid"
              @click="validate()"
            >
              Submit
            </v-btn>
          </div>
        </v-form>

        <confirm-dialog
          v-model="dialog"
          :confirm="confirm"
          :cardio="cardioFields"
          :weights="weightFields"
          :cardio-total="cardio"
          :weights-total="weights"
          :gym-total="gymTotal"
          :date-time="dateTime"
          :gym-name="gymName"
          @submit="submit()"
        />
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
import moment from "moment";
// data
import GymLimits from "@/data/GymLimits";
import InputFields from "@/data/InputFields";
// components
import TopActions from "@/components/Home/TopActions.vue";
import ConfirmDialog from "@/components/Home/ConfirmDialog.vue";
import CountTextField from "@/components/Home/CountTextField.vue";
import TimeTextField from "@/components/Home/TimeTextField.vue";

@Component({
  components: {
    TopActions,
    ConfirmDialog,
    CountTextField,
    TimeTextField,
  },
})
export default class Home extends Vue {
  weightFields: InputFields = {
    powerRacks: { label: "Power Racks", count: "" },
    benchPress: { label: "Bench Press", count: "" },
    dumbbells: { label: "Dumbbells", count: "" },
    other: {
      label: "Other",
      count: "",
      help: {
        info: "Mats and weight machines not included above",
        show: false,
      },
    },
  };

  cardioFields: InputFields = {
    treadmills: { label: "Treadmills", count: "" },
    ellipticals: { label: "Ellipticals", count: "" },
    bikes: { label: "Bikes", count: "" },
    amts: { label: "AMTs", count: "" },
  };

  valid = true;
  timeValid = true;

  dateTime = new Date();
  timeInterval: any = null;
  timeEditted = false;
  timeHelp = false;

  gymName = "";
  gymId = "";
  readonly limits = GymLimits;

  dialog = false;
  confirm = "";
  error = "";

  getDate(): string {
    const date = moment(this.dateTime);
    return date.format("ddd MMM D, YYYY");
  }

  getTime(): string {
    const time = moment(this.dateTime);
    return time.format("h:mm A");
  }

  setTime(value: string) {
    const momentTime = moment(
      `${moment().format("YYYY-MM-DD")} ${value}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"],
      true
    );

    this.dateTime = momentTime.toDate();
  }

  get weights(): string {
    const wf = this.weightFields;
    const prNum = Number.parseInt(wf.powerRacks.count);
    const bpNum = Number.parseInt(wf.benchPress.count);
    const dbNum = Number.parseInt(wf.dumbbells.count);
    const otNum = Number.parseInt(wf.other.count);
    if (isNaN(prNum) || isNaN(bpNum) || isNaN(dbNum) || isNaN(otNum)) return "";
    return (prNum + bpNum + dbNum + otNum).toString();
  }

  get cardio(): string {
    const cf = this.cardioFields;
    const tmNum = Number.parseInt(cf.treadmills.count);
    const elNum = Number.parseInt(cf.ellipticals.count);
    const bkNum = Number.parseInt(cf.bikes.count);
    const amNum = Number.parseInt(cf.amts.count);
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
    return this.$refs.form;
  }

  get timeForm(): any {
    return this.$refs.timeForm;
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
    if (localStorage.gymId) {
      this.gymName = localStorage.gymName;
      this.gymId = localStorage.gymId;
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
      this.dateTime = new Date();
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
      name: "export",
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
    // call Vuetify form validation
    this.form.validate();
    const timeValid = this.timeForm.validate();

    // clear error
    this.error = "";

    if (!timeValid) {
      this.error = "Please check the time input.";
      return;
    }

    // check if data is empty
    if (!this.weights || !this.cardio) {
      this.error = "Please verify your data.";
      return;
    }
    const weightsNum = Number.parseInt(this.weights);
    const cardioNum = Number.parseInt(this.cardio);

    // check gym limits
    const gymLimits = this.limits[this.gymId];
    if (cardioNum > gymLimits.cardio) {
      this.error = `${this.gymName} does not have space for ${cardioNum} cardio.`;
      return;
    }
    if (weightsNum > gymLimits.other) {
      this.error = `${this.gymName} does not have space for ${weightsNum} weights.`;
      return;
    }

    // TODO: redesign confirm dialog
    // create confirmation message
    this.confirm = `${this.gymName} at ${this.getTime()}: there's ${
      this.cardio
    } ${
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
    this.stopInterval();
    const db = firebase.firestore();
    const cf = this.cardioFields;
    const wf = this.weightFields;
    db.collection("gyms")
      .doc(this.gymId)
      .collection("counts")
      .add({
        cardio: {
          treadmills: Number.parseInt(cf.treadmills.count),
          ellipticals: Number.parseInt(cf.ellipticals.count),
          bikes: Number.parseInt(cf.bikes.count),
          amts: Number.parseInt(cf.amts.count),
        },
        weights: {
          powerRacks: Number.parseInt(wf.powerRacks.count),
          benchPress: Number.parseInt(wf.benchPress.count),
          dumbbells: Number.parseInt(wf.dumbbells.count),
          other: Number.parseInt(wf.other.count),
        },
        time: this.dateTime,
        // TODO: change this to `true` for deployment
        valid: false,
      })
      .then(() => {
        this.dateTime = new Date();
        this.startInterval(1000);
        this.confirm = "";
        this.clearInputs();
        // TODO: confirmation message/notification that data was submitted
      })
      .catch(() => {
        this.error = "There was an error in adding the document.";
        return;
      });
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
.h-36px {
  height: 36px;
}
</style>
