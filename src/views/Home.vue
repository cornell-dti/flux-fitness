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
        <h1 class="mb-2">{{ gym }}</h1>

        <span class="d-inline-flex align-center mt-3">
          <v-icon color="black" left>today</v-icon>
          <h4 class="font-weight-regular pl-1">{{ time.toDateString() }}</h4>
        </span>
        <v-text-field
          class="pt-0 mt-0"
          v-model="timeSelect"
          type="time"
          @input="stopInterval()"
        >
          <div class="h-36px d-flex align-center" slot="prepend">
            <v-icon color="black">schedule</v-icon>
          </div>
          <v-tooltip slot="append" bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon :disabled="!timeEditted" @click="startInterval()">
                <v-icon v-on="on">restore</v-icon>
              </v-btn>
            </template>
            <span>Reset time to the current time</span>
          </v-tooltip>
          <v-tooltip v-model="timeHelp" slot="append-outer" bottom small>
            <template v-slot:activator="{}">
              <v-btn icon @click="timeHelp = !timeHelp">
                <v-icon>help</v-icon>
              </v-btn>
            </template>
            <span>The time that will be submitted with the gym counts</span>
          </v-tooltip>
        </v-text-field>

        <p class="pt-3">
          Please enter the number of people using the following equipment.
        </p>

        <v-form ref="form" v-model="valid" lazy-validation>
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

          <v-row v-if="!!gymTotal">
            <v-col>
              <h2 class="gym-total">
                <b>Gym Total:</b>
                {{ gymTotal }}
              </h2>
            </v-col>
          </v-row>

          <p class="text-right mt-2 red--text">{{ error }}</p>
          <div class="float-right pt-2">
            <v-btn class="mr-2" text @click="clearInputs()">Clear All</v-btn>
            <v-btn color="blue" outlined :disabled="!valid" @click="validate()">
              Submit
            </v-btn>
          </div>
        </v-form>

        <confirm-dialog v-model="dialog" :confirm="confirm" @submit="submit()"/>
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
import CountTextField from "@/components/Home/CountTextField.vue";
import GymLimits from "@/data/GymLimits";
import Axios from "axios";

@Component({
  components: {
    TopActions,
    ConfirmDialog,
    CountTextField,
  },
})
export default class Home extends Vue {
  weightFields: {
    [key: string]: {
      label: string;
      count: string;
      help?: { info: string; show: boolean };
    };
  } = {
    powerRacks: { label: "Power Racks", count: "" },
    benchPress: { label: "Bench Press", count: "" },
    dumbbells: { label: "Dumbbells", count: "" },
    other: {
      label: "Other",
      count: "",
      help: {
        info: `"Other" includes mats and other weight machines not included
                    above`,
        show: false,
      },
    },
  };

  cardioFields: {
    [key: string]: {
      label: string;
      count: string;
      help?: { info: string; show: boolean };
    };
  } = {
    treadmills: { label: "Treadmills", count: "" },
    ellipticals: { label: "Ellipticals", count: "" },
    bikes: { label: "Bikes", count: "" },
    amts: { label: "AMTs", count: "" },
  };

  valid = true;

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
    const wf = this.weightFields;
    const prNum = Number.parseInt(wf["powerRacks"].count);
    const bpNum = Number.parseInt(wf["benchPress"].count);
    const dbNum = Number.parseInt(wf["dumbbells"].count);
    const otNum = Number.parseInt(wf["other"].count);
    if (isNaN(prNum) || isNaN(bpNum) || isNaN(dbNum) || isNaN(otNum)) return "";
    return (prNum + bpNum + dbNum + otNum).toString();
  }

  get cardio(): string {
    const cf = this.cardioFields;
    const tmNum = Number.parseInt(cf["treadmills"].count);
    const elNum = Number.parseInt(cf["ellipticals"].count);
    const bkNum = Number.parseInt(cf["bikes"].count);
    const amNum = Number.parseInt(cf["amts"].count);
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
    this.confirm = `${this.gym} at ${this.timeSelect}: there's ${this.cardio} ${
      this.cardio === "1" ? " person" : " people"
    } using cardio machines and ${this.weights} ${
      this.weights === "1" ? " person" : " people"
    } using weights.`;

    this.dialog = true;
  }

  roundToQuarter(time: Date) {
    const hours = time.getHours()
    const suffix = (hours >= 12) ? 'pm' : 'am'
    const hoursRegular = (hours !== 0) ? hours % 12 : 12
    const minutes = time.getMinutes()
    const nearestQuarter = (minutes <= 30) ? 15 : 45

    return `${hoursRegular}:${nearestQuarter}${suffix}`
  }
  /**
   * Submits data to Firebase
   */
  submit() {
    if (this.weights && this.cardio) {
      const db = firebase.firestore();
      let current_gym = this.gym.toLowerCase();
      db.collection("gymdatatest")
        .doc(current_gym)
        .collection("counts")
        .add({
          cardio: Number.parseInt(this.cardio),
          weights: Number.parseInt(this.weights),
          // TODO: make this use timeSelect
          time: this.time,
        })
        .then(() => {
          this.confirm = "";
          // TODO: change this to not use Vue notify
          this.$notify({
            group: "default_group",
            type: "success",
            duration: 2500,
            title: "Success",
            text: "The data you entered went through!",
          });
        })
        .catch(() => {
          this.error = "There was an error in adding the document.";
          return;
        });
        let day = ""
        switch (this.time.getDay()) {
          case 0:
            day = "Sunday";
            break;
          case 1:
            day = "Monday"
            break;
          case 2:
            day = "Tuesday"
            break;
          case 3:
            day = "Wednesday"
            break;
          case 4:
            day = "Thursday"
            break;
          case 5:
            day = "Friday"
            break;
          case 6:
            day = "Saturday"
        }
        const postData =
        {
          time: this.roundToQuarter(this.time),
          cardio: this.cardio,
          weights: this.weights
        }
        const options = {
          headers: {'Content-Type': 'application/json'}
        }
        let url = 'http://localhost:5000/update-live-averages' + '?id=' + current_gym + '&day=' + day;
        Axios.post(url, postData, options).then(() => {
          console.log('successfully made post request')
        }).catch(err => {
          console.log(err)
        })
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
