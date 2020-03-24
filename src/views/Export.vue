<template>
  <app-card>
    <div class="text">
      <h1>Export</h1>
      <p>Export data.</p>
    </div>
    <form class="date-form">
      <div class="date-select">
        <i class="material-icons">date_range</i>
        <input class="date-input" v-model="start_date" type="date" required />
        &mdash;
        <input class="date-input" v-model="end_date" type="date" required />
      </div>
    </form>
    <div class="text">
      <p>Click "Download" to export data as an Excel spreadsheet.</p>
    </div>
    <boxed-button :disabled="downloading" v-on:click="download" />
    <div id="error">{{error}}</div>
    <p :hidden="!downloading">Download is in progress...</p>
    <action-button-group
      :require-confirmation="true"
      v-on:submitted="handler()"
      action-button-text="DONE"
    />
  </app-card>
</template>

<script lang="ts">
import Component from "vue-class-component";
import AppCard from "@/components/AppCard.vue";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import BoxedButton from "@/components/BoxedButton.vue";
import Vue from "vue";
import * as firebase from "firebase/app";
import "firebase/functions";

@Component({
  components: {
    ActionButtonGroup,
    AppCard,
    BoxedButton
  }
})
export default class Settings extends Vue {
  active = false;
  downloading = false;
  offset = new Date().getTimezoneOffset();
  end_date = new Date(new Date().getTime() - this.offset * 60000)
    .toISOString()
    .substring(0, 10);
  start_date = new Date(
    new Date(this.end_date).getTime() - 60 * 60 * 24 * 7 * 1000
  )
    .toISOString()
    .substring(0, 10);
  error = "";

  handler() {
    this.$router.push({
      name: "home"
    });
  }

  download() {
    this.error = "";
    if (this.start_date > this.end_date) {
      this.error = "Please enter a valid date range.";
      return;
    } else if (this.start_date === "" || this.end_date === "") {
      this.error = "Please enter valid dates.";
      return;
    }
    this.downloading = true;
    const getURL = firebase.functions().httpsCallable("getURL");
    // Uncomment if running `npm run shell` for backend functions:
    // firebase.functions().useFunctionsEmulator("http://localhost:5000");
    let gymId = localStorage.gym.toLowerCase();
    if (gymId === "helen newman") {
      gymId = "helen_newman";
    }
    const startDate = this.start_date;
    const endDate = this.end_date;
    const offset = this.offset;
    getURL({ id: gymId, startDate, endDate, offset })
      .then(res => {
        this.downloading = false;
        const storage = firebase.storage();
        const gsref = storage.refFromURL(`gs:/${res.data}`);
        gsref.getDownloadURL().then(url => {
          window.open(url);
        });
      })
      .catch(() => {
        this.downloading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/variables";

.text {
  padding-right: 30px;
}

#error {
  padding-top: 15px;
  text-align: left;
  margin-bottom: 10px;
  color: #fa4735;
}

.date-input {
  border: solid 1px black;
  border-radius: 5px;
  margin-left: 0px;
  max-width: 30%;
}

.date-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  display: none;
  margin: 0px;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 100;
  margin-left: -15px;
}

.material-icons {
  color: black;
  vertical-align: middle;
  font-size: 20px;
  margin-right: 16px;
}

.button-boxed {
  padding-right: 16px;

  .material-icons {
    color: white;
    vertical-align: middle;
    font-size: 20px;
  }

  &:disabled {
    color: white;
    background-color: $mainAccentDisable;
  }
}
</style>
