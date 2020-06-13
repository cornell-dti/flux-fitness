<template>
  <v-container fluid>
    <v-col cols="12" class="px-8 mx-auto export-form">
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
          <h1>Export from {{ gymName }}</h1>
          <p>
            Please select a date range to export the data.
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-form>
          <v-col>
            <date-quick-select
              class="pb-3"
              @select="quickSelect($event)"
              :edited="edited"
            />
            <date-picker-menu
              v-model="startDate"
              label="Start date"
              prepend-icon="today"
              @input="edited = true"
            />
            <date-picker-menu
              v-model="endDate"
              label="End date"
              prepend-icon="event"
              @input="edited = true"
            />
          </v-col>
        </v-form>
      </v-row>

      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                color="primary"
                v-on="on"
                @click="download"
                :loading="downloading"
              >
                <v-icon left>file_download</v-icon>
                Download
              </v-btn>
            </template>
            <span>Click to export data as an Excel spreadsheet</span>
          </v-tooltip>
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
import DateQuickSelect from "@/components/Export/DateQuickSelect.vue";

@Component({
  components: {
    DatePickerMenu,
    DateQuickSelect,
  },
})
export default class Settings extends Vue {
  downloading = false;

  startDate = moment().startOf("week").format("YYYY-MM-DD");

  endDate = moment().format("YYYY-MM-DD");

  error = "";

  edited = false;

  gymName = localStorage.gymName;

  /**
   * Navigates to home page
   */
  goHome(): void {
    this.$router.push({
      name: "home",
    });
  }

  /**
   * Sets `startDate` and `endDate` based on preset intervals
   */
  quickSelect(selection: string): void {
    this.edited = false;
    let start = moment();
    let end = moment();

    switch (selection) {
      case "thisWeek":
        start = moment().startOf("week");
        break;
      case "lastWeek":
        start = moment().subtract(1, "weeks").startOf("week");
        end = moment(start).add(6, "days");
        break;
      case "weekToDate":
        start = moment().subtract(7, "days");
        break;
      case "monthToDate":
        start = moment().subtract(1, "months");
        break;
      case "prevMonth":
        start = moment().subtract(1, "months").startOf("month");
        end = moment(start).endOf("month");
        break;
    }

    this.startDate = start.format("YYYY-MM-DD");
    this.endDate = end.format("YYYY-MM-DD");
  }

  /**
   * Attempts to download spreadsheet by calling the Firebase function
   */
  download(): void {
    this.error = "";
    if (this.startDate === "" || this.endDate === "") {
      this.error = "Please enter valid dates.";
      return;
    }
    if (this.startDate > this.endDate) {
      this.error = "Please enter a valid date range.";
      return;
    }
    if (this.endDate > moment().format("YYYY-MM-DD")) {
      this.error = "Please select an end date that is today or earlier.";
      return;
    }
    this.downloading = true;
    const getURL = firebase.functions().httpsCallable("getURL");
    // Uncomment if running `npm run shell` for backend functions:
    // firebase.functions().useFunctionsEmulator("http://localhost:5000");
    let gymId = localStorage.gymId;
    const startDate = this.startDate;
    const endDate = this.endDate;
    getURL({ id: gymId, startDate, endDate })
      .then((res) => {
        this.downloading = false;
        const storage = firebase.storage();
        const gsref = storage.refFromURL(`gs://campus-density-gym/${res.data}`);
        gsref.getDownloadURL().then((url) => {
          window.open(url);
        });
      })
      .catch(() => {
        this.error = "Error downloading.";
        this.downloading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/variables";

.export-form {
  max-width: 600px;
}

#error {
  padding-top: 15px;
  text-align: left;
  margin-bottom: 10px;
  color: $colorError;
}
</style>
