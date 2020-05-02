<template>
  <v-container fluid>
    <v-row>
      <v-col class="pl-0">
        <v-btn rounded text @click="goHome()">
          <v-icon left>arrow_back</v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pb-0">
        <h1>Export</h1>
        <p>
          Please select a date range to export the data.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-form>
        <v-col>
          <date-picker-menu
            v-model="startDate"
            label="Start date"
            prepend-icon="today"
          />
          <date-picker-menu
            v-model="endDate"
            label="End date"
            prepend-icon="event"
          />
        </v-col>
      </v-form>
    </v-row>

    <v-row>
      <v-col>
        <p>Click "Download" to export data as an Excel spreadsheet.</p>
        <v-btn color="primary" @click="download" :loading="downloading">
          <v-icon left>file_download</v-icon>Download
        </v-btn>
      </v-col>
    </v-row>
    <div id="error">{{ error }}</div>
    <p :hidden="!downloading">Download is in progress...</p>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import * as firebase from "firebase/app";
import "firebase/functions";
import "firebase/storage";
import moment from "moment";
// components
import AppCard from "@/components/AppCard.vue";
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";
import BoxedButton from "@/components/BoxedButton.vue";
import DatePickerMenu from "@/components/Export/DatePickerMenu.vue";

@Component({
  components: {
    ActionButtonGroup,
    AppCard,
    BoxedButton,
    DatePickerMenu,
  },
})
export default class Settings extends Vue {
  active = false;
  downloading = false;
  offset = new Date().getTimezoneOffset();

  endDate = moment().format("YYYY-MM-DD");
  startDate = moment().subtract(6, "days").format("YYYY-MM-DD");

  end_date = moment().format("YYYY-MM-DD");
  start_date = moment().subtract(6, "days").format("YYYY-MM-DD");
  error = "";

  goHome() {
    this.$router.push({
      name: "home",
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
    let gymId = localStorage.gymId;
    const startDate = this.start_date;
    const endDate = this.end_date;
    const offset = this.offset;
    getURL({ id: gymId, startDate, endDate, offset })
      .then((res) => {
        this.downloading = false;
        const storage = firebase.storage();
        const gsref = storage.refFromURL(`gs:/${res.data}`);
        gsref.getDownloadURL().then((url) => {
          window.open(url);
        });
      })
      .catch((e) => {
        console.log("Error downloading.\n" + e);
        this.downloading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/variables";

#error {
  padding-top: 15px;
  text-align: left;
  margin-bottom: 10px;
  color: #fa4735;
}
</style>
