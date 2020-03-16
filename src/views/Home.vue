<template>
  <app-card>
    <div class="nav-group">
      <button class="nav-button" title="Export" v-on:click="goExport">
        <i class="material-icons nav-icon">cloud_download</i>
        <div class="hint">Export</div>
      </button>
      <button class="nav-button" title="Log Out" v-on:click="signOut">
        <i class="material-icons nav-icon">exit_to_app</i>
        <div class="hint">Log Out</div>
      </button>
      <a
        id="questions"
        href="https://docs.google.com/document/d/1nFARd_tRBTzdi7-BhkwmLKih-34G4zsHB-DZk-mx4KA/edit"
      >Have questions?</a>
    </div>
    <h1>{{gym}}</h1>
    <form id="forms">
      <p>
        Please indicate how many people are currently
        <strong>using cardio machines</strong>.
      </p>
      <div class="icon-input">
        <i class="material-icons">directions_run</i>
        <input
          v-model="cardio"
          type="number"
          min="0"
          step="1"
          placeholder="using cardio machines"
          class="data-input"
        />
      </div>
      <p>
        Please indicate how many people are currently
        <strong>using weights</strong>.
      </p>
      <div class="icon-input">
        <i class="material-icons">people</i>
        <input
          v-model="weights"
          type="number"
          min="0"
          step="1"
          required
          placeholder="using weights"
          class="data-input"
        />
      </div>
    </form>

    <div id="error">{{error}}</div>
    <action-button-group action-button-text="SUBMIT" v-on:submitted="submit()" />
  </app-card>
</template>

<script lang="ts">
import * as firebase from "firebase";
import Component from "vue-class-component";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import AppCard from "@/components/AppCard.vue";
import Vue from "vue";
import VueSimpleAlert from "vue-simple-alert";

Vue.use(VueSimpleAlert);

@Component({
  components: {
    ActionButtonGroup,
    AppCard
  }
})
export default class Home extends Vue {
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
    this.$confirm(this.confirm, "Confirm")
      .then(() => {
        this.handler();
      })
      .catch(() => {
        console.log("Data input not confirmed.");
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
          console.log("Successfully added document!");
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
          console.log("There was an error in adding the document.");
          this.error = "There was an error in adding the document.";
          return;
        });
      this.weights = "";
      this.cardio = "";
      this.confirm = "";
      console.log(this.weights);
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
        console.log("Logged out.");
        this.$router.push({ name: "login" });
      });
  }
}
</script>

<style lang="scss">
form {
  margin-top: 20px;
  margin-right: 30px;
  text-align: left;
}

#error {
  text-align: left;
  margin-bottom: 10px;
  color: #fa4735;
}

.material-icons {
  color: black;
  font-size: 24px;
  vertical-align: middle;
}

.data-input {
  margin-left: 10px;
}

#questions {
  margin-left: 145px;
  margin-top: 30px;
  text-decoration: none;
}

.nav-group {
  margin-left: -10px;
  margin-right: 0px;
  text-align: left;
}

.nav-button {
  width: 60px;
  height: 70px;
  padding: 15px 5px;
  border-width: 0;
  font-family: inherit;
  font-size: 12px;
  border-radius: 3.5px;
  background-color: #fff;
}

.hint {
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.nav-button:hover {
  background-color: #ededed;
}
</style>

