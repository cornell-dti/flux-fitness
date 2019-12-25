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
          :disabled="active"
          v-model="cardio"
          type="number"
          min="0"
          step="1"
          placeholder="using cardio machines"
        />
      </div>
      <p>
        Please indicate how many people are currently
        <strong>using weights</strong>.
      </p>
      <div class="icon-input">
        <i class="material-icons">people</i>
        <input
          :disabled="active"
          v-model="weights"
          type="number"
          min="0"
          step="1"
          required
          placeholder="using weights"
        />
      </div>
    </form>

    <!-- <p>You indicated that {{text}} people are in the gym. Press submit if this is correct.</p> -->
    <p>{{confirm}}</p>
    <div id="error">{{error}}</div>
    <action-button-group
      :active="active"
      :require-confirmation="true"
      action-button-text="SUBMIT"
      v-on:submitted="submit(true)"
      v-on:cancel="submit(false)"
      v-on:confirm="handler()"
    />
  </app-card>
</template>

<script lang="ts">
import * as firebase from "firebase";
import Component from "vue-class-component";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import AppCard from "@/components/AppCard.vue";
import Vue from "vue";

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
  confirm = "";
  error = "";
  active: boolean = false;

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

  submit(active: boolean) {
    this.error = "";
    let weightsNum = Number.parseInt(this.weights);
    let cardioNum = Number.parseInt(this.cardio);
    if (!this.weights || !this.cardio) {
      this.error = "Please verify your data.";
      return;
    }
    if (active) {
      const time = new Date();
      time.setMilliseconds(Math.round(time.getMilliseconds() / 1000) * 1000);
      time.setSeconds(Math.round(time.getSeconds() / 60) * 60);
      time.setMinutes(Math.round(time.getMinutes() / 15) * 15);
      const roundedTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
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
    } else {
      this.confirm = "";
    }
    this.active = active;
  }

  handler() {
    if (this.weights && this.cardio) {
      var db = firebase.firestore();
      let current_gym = this.gym.toLowerCase();
      var addDoc = db
        .collection("gymdata")
        .doc(current_gym)
        .collection("counts")
        .add({
          cardio: Number.parseInt(this.cardio),
          weights: Number.parseInt(this.weights),
          time: this.time
        })
        .then(ref => {
          console.log("Successfully added document!");
          this.confirm = "";
          this.weights = "";
          this.cardio = "";
          this.active = false;
          this.$notify({
            group: "default_group",
            type: "success",
            duration: 2500,
            title: "Success",
            text: "The data you entered went through!"
          });
        })
        .catch(err => {
          console.log("There was an error in adding the document.");
          this.error = "There was an error in submitting";
        });
      this.weights = "";
      this.cardio = "";
      this.confirm = "";
      this.active = false;
    } else {
      // window.alert("You didn't enter a value!");
      this.error = "Please enter a value";
    }
  }

  signOut() {
    localStorage.clear();
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("signed out");
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

.nav-group {
  margin-right: 20px;
  text-align: right;
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

