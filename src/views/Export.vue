<template>
  <v-container fluid>
    <v-col cols="12" sm="8" md="5" class="mx-auto">
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
    </v-col>
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
import DatePickerMenu from "@/components/Export/DatePickerMenu.vue";

@Component({
  components: {
    DatePickerMenu,
  },
})
export default class Settings extends Vue {
  downloading = false;
  readonly offset = new Date().getTimezoneOffset();

  endDate = moment().format("YYYY-MM-DD");
  startDate = moment().subtract(6, "days").format("YYYY-MM-DD");

  error = "";

  /**
   * Navigates to home page
   */
  goHome() {
    this.$router.push({
      name: "home",
    });
  }

  /**
   * Attempts to download spreadsheet by calling the Firebase function
   */
  download() {
    this.error = "";
    if (this.startDate === "" || this.endDate === "") {
      this.error = "Please enter valid dates.";
      return;
    }
    if (this.startDate > this.endDate) {
      this.error = "Please enter a valid date range.";
      return;
    }
    this.downloading = true;
    const getURL = firebase.functions().httpsCallable("getURL");
    // Uncomment if running `npm run shell` for backend functions:
    // firebase.functions().useFunctionsEmulator("http://localhost:5000");
    let gymId = localStorage.gymId;
    const startDate = this.startDate;
    const endDate = this.endDate;
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
