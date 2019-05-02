<template>
  <app-card>
    <div class="nav-group">
      <button class="nav-button" title="Settings" v-on:click="goSettings">
        <i class="material-icons">settings</i>
        <div class="hint">Settings</div>
      </button>
      <button class="nav-button" title="Log Out" v-on:click="signOut">
        <i class="material-icons">exit_to_app</i>
        <div class="hint">Log Out</div>
      </button>
    </div>
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <h1>{{gym}}</h1>
    <form id="forms">
      <p>
        Please indicate how many people are currently
        <b>using the treadmills</b>.
      </p>
      <div class="input">
        <i class="material-icons">directions_run</i>
        <input :disabled="active" v-model="treadmill" type="number" min="0" step="1">
      </div>
      <p>
        Please indicate how many people are currently in the gym
        <b>in total</b>.
      </p>
      <div class="input">
        <i class="material-icons">people</i>
        <input :disabled="active" v-model="total" type="number" min="0" step="1">
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
  total = "";
  treadmill = "";
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

  goSettings() {
    this.$router.push({
      name: "settings"
    });
  }

  submit(active: boolean) {
    this.error = "";
    var totalNum = Number.parseInt(this.total);
    var treadmillNum = Number.parseInt(this.treadmill);
    if (treadmillNum > totalNum || !this.total) {
      this.error = "Please verify your data.";
      return;
    }
    if (active) {
      this.confirm =
        "Please confirm that there are " +
        (this.treadmill
          ? this.treadmill + " people using the treadmills and "
          : "") +
        this.total +
        " people in total.";
    } else {
      this.confirm = "";
    }
    this.active = active;
  }

  handler() {
    if (this.total) {
      var db = firebase.firestore();
      let current_gym = this.gym.toLowerCase();
      var addDoc = db
        .collection("gymdata")
        .doc(current_gym)
        .collection("counts")
        .add({
          treadmill: Number.parseInt(this.treadmill),
          count: Number.parseInt(this.total),
          time: new Date()
        })
        .then(ref => {
          console.log("Succesfully added document!");
          this.confirm = this.total = this.treadmill = ""; 
          this.active = false; 
          this.$notify({
            group: 'foo',
            type: 'success',
            duration: 2500,
            title: 'Success',
            text: 'The data you entered went through!'
          });
        })
        .catch(err => {
          this.error = "There was an error in submitting";
        });
      console.log(this.total);
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
        // TODO add a procedure to redirect back to login just in case (this is already handled in router but be safe)
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
  text-align: center;
  margin-bottom: 10px;
  color: #fa4735;
}

.nav-group {
  margin-right: 20px;
  text-align: right;
}

.material-icons {
  color: black;
  font-size: 12px;
  vertical-align: middle;
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
  margin-top: 5px;
  display: block;
}

.nav-button:hover {
  background-color: #ededed;

  // & .hint {
  //   display: block;
  // }
}
</style>

