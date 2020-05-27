<template>
  <v-container class="fill-height" fluid>
    <v-snackbar v-model="successBar" top color="success" timeout="7000">
      Successfully added to database!
      <v-btn text @click="successBar = false">
        Close
      </v-btn>
    </v-snackbar>

    <v-row class="justify-center justify-sm-end">
      <top-actions @logout="signOut" @export="goExport" @help="goHelp" />
    </v-row>

    <v-row>
      <v-col cols="12" class="px-8 mx-auto gym-form">
        <h1 class="mb-2">{{ gymName }}</h1>

        <span class="d-inline-flex align-center mt-3">
          <v-icon color="black" left>today</v-icon>
          <h4 class="font-weight-regular pl-1">{{ getDate() }}</h4>
        </span>

        <v-form ref="timeForm" v-model="timeValid">
          <v-col class="ma-0 pa-0" cols="12" sm="4">
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
          </v-col>
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
          :cardio="cardioFields"
          :weights="weightFields"
          :cardio-total="cardio"
          :weights-total="weights"
          :gym-total="gymTotal"
          :date-time="dateTime"
          :gym-name="gymName"
          @submit="submit()"
          @exit="startInterval()"
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
import Axios from "axios";
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
  /* classes describing the input fields for the form */
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

  /* form validation variables */
  valid = true;
  timeValid = true;

  /* date and time-related variables */
  dateTime = new Date();
  timeInterval: any = null;
  timeEditted = false;
  timeHelp = false;

  /* gym information: name, IDs, and limits */
  gymName = "";
  gymId = "";
  readonly limits = GymLimits;

  /* variables describing popup/dynamic display elements */
  dialog = false;
  successBar = false;
  error = "";

  /**
   * Gets date as a string in format `ddd MMM D, YYYY`
   */
  getDate(): string {
    const date = moment(this.dateTime);
    return date.format("ddd MMM D, YYYY");
  }

  /**
   * Gets time as a string in format `h:mm A`
   */
  getTime(): string {
    const time = moment(this.dateTime);
    return time.format("h:mm A");
  }

  /**
   * Sets time by converting string input to date object and storing it
   * to `this.dateTime`
   */
  setTime(value: string) {
    const momentTime = moment(
      `${moment().format("YYYY-MM-DD")} ${value}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"],
      true
    );

    this.dateTime = momentTime.toDate();
  }

  /**
   * Getter for weight total count as a string
   */
  get weights(): string {
    const wf = this.weightFields;
    const prNum = Number.parseInt(wf.powerRacks.count);
    const bpNum = Number.parseInt(wf.benchPress.count);
    const dbNum = Number.parseInt(wf.dumbbells.count);
    const otNum = Number.parseInt(wf.other.count);
    if (isNaN(prNum) || isNaN(bpNum) || isNaN(dbNum) || isNaN(otNum)) return "";
    return (prNum + bpNum + dbNum + otNum).toString();
  }

  /**
   * Getter for cardio total count as a string
   */
  get cardio(): string {
    const cf = this.cardioFields;
    const tmNum = Number.parseInt(cf.treadmills.count);
    const elNum = Number.parseInt(cf.ellipticals.count);
    const bkNum = Number.parseInt(cf.bikes.count);
    const amNum = Number.parseInt(cf.amts.count);
    if (isNaN(tmNum) || isNaN(elNum) || isNaN(bkNum) || isNaN(amNum)) return "";
    return (tmNum + elNum + bkNum + amNum).toString();
  }

  /**
   * Getter for gym total count as a string
   */
  get gymTotal(): string {
    const weightsNum = Number.parseInt(this.weights);
    const cardioNum = Number.parseInt(this.cardio);
    if (isNaN(weightsNum) || isNaN(cardioNum)) return "";
    this.error = "";
    return (weightsNum + cardioNum).toString();
  }

  /**
   * Getter for the ref to the main form for gym counts
   */
  get form(): any {
    return this.$refs.form;
  }

  /**
   * Getter for the ref to the form that includes the TimeTextField
   */
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
  startInterval(interval: number = 1000) {
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

    this.stopInterval();
    this.dialog = true;
  }

  // TODO: use Moment
  roundDate(d: Date) {
    const date = moment(d);
    date.millisecond(Math.floor(date.millisecond() / 1000) * 1000);
    date.second(Math.floor(date.second() / 60) * 60);
    date.minute(Math.round((date.minute() + 15) / 30) * 30 - 15);
    return date.format("h:mma");
  }

  updateHistoricalAverages() {
    let day = "";
    switch (this.dateTime.getDay()) {
      case 0:
        day = "Sunday";
        break;
      case 1:
        day = "Monday";
        break;
      case 2:
        day = "Tuesday";
        break;
      case 3:
        day = "Wednesday";
        break;
      case 4:
        day = "Thursday";
        break;
      case 5:
        day = "Friday";
        break;
      case 6:
        day = "Saturday";
    }
    const postData = {
      time: this.roundDate(this.dateTime),
      cardio: this.cardio,
      weights: this.weights,
    };
    const options = {
      headers: { "Content-Type": "application/json" },
    };
    let url =
      process.env.VUE_APP_UPDATE_GYM_HISTORICAL_AVERAGES_API +
      "?id=" +
      this.gymId +
      "&day=" +
      day;
    Axios.post(url, postData, options)
      .then(() => {
        // SUCCESSFUL POST REQUEST :)
      })
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Submits data to Firebase
   */
  submit() {
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
        this.clearInputs();
        this.successBar = true;
      })
      .catch(() => {
        this.error = "There was an error adding to the database.";
        return;
      });
    this.updateHistoricalAverages();
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

.gym-form {
  max-width: 600px;
}
</style>
