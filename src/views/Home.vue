<template>
  <div class="full">
    <div class="home middle">
      <div class="actions">
        <button class="button-flat" title="Settings">
          <i class="material-icons">settings</i>
        </button>
        <button class="button-flat" title="Log Out" v-on:click="signOut">
          <i class="material-icons">exit_to_app</i>
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
      <div class="buttons">
        <button :hidden="active" class="action-button" id="submit" v-on:click="submit(true)">SUBMIT</button>
        <button :hidden="!active" class="action-button" id="cancel" v-on:click="submit(false)">CANCEL</button>
        <button :hidden="!active" class="action-button" id="confirm" v-on:click="handler">CONFIRM</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as firebase from "firebase";
import Component from "vue-class-component";
import Vue from "vue";

@Component
export default class Home extends Vue {
  total = "";
  treadmill = "";
  gym = "";
  confirm = "";
  error = "";
  active: boolean = false;

  created() {
    this.gym = this.$route.params.gym;
    console.log("This is the gym that was passed", this.gym);
  }

  // creates persistence across refresh
  mounted() {
    if (localStorage.gym) {
      this.gym = localStorage.gym;
    }
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
          count: Number.parseInt(this.total),
          time: new Date()
        })
        .then(ref => {
          console.log("Added document with ID: ", ref.id);
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

.actions {
  margin-right: 20px;
  text-align: right;
}

.buttons {
  margin-top: 20px;
  height: 50px;
  width: 100%;
  text-align: right;
}

.action-button {
  margin-right: 20px;
}

#cancel {
  margin-right: 10px;
}

.material-icons {
  color: #000;
  font-size: 20px;
  vertical-align: middle;
}

.button-flat {
  width: 60px;
  height: 60px;
  padding: 15px 5px;
  border-width: 0;
  font-family: inherit;
  font-size: 12px;
  border-radius: 3.5px;
  background-color: #fff;
}

.button-flat:hover {
  background-color: #ededed;
}
</style>

