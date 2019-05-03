<template>
  <app-card>
    <div class="text">
      <h1>Export</h1>
      <p>Export data.</p>
    </div>
    <div class="date-spoiler">
      <button v-on:click="toggleDateSelect()">Select Dates</button>
    </div>
    <form :hidden="select_date" class="date-form">
      <div class="date-select">
        <i class="material-icons">date_range</i>
        <input class="date-input" v-model="start_date" type="date">
        &mdash;
        <input class="date-input" v-model="end_date" type="date">
      </div>
    </form>
    <div class="text">
      <p>Click "Download" to export data as an Excel spreadsheet.</p>
    </div>
    <boxed-button :disabled="downloading" v-on:click="download"/>
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
import firebase from "firebase";
import axios from "axios";

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
  select_date = true;
  start_date = "";
  end_date = "";

  handler() {
    this.$router.push({
      name: "home"
    });
  }

  toggleDateSelect() {
    this.select_date = !this.select_date;
  }

  download() {
    this.downloading = true;
    const getURL = firebase.functions().httpsCallable("getURL");
    let gymId = localStorage.gym.toLowerCase();
    if (gymId === "helen newman") {
      gymId = "helen_newman";
    }
    getURL({ id: gymId })
      .then(res => {
        this.downloading = false;
        console.log("DONE");
        const storage = firebase.storage();
        const gsref = storage.refFromURL(`gs:/${res.data}/${gymId}.xlsx/`);
        gsref.getDownloadURL().then(url => {
          window.open(url);
        });
      })
      .catch(err => {
        console.log(err);
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

.date-select {
  white-space: nowrap;
}

.date-input {
  width: 120px;
  padding-right: 0;
}

.material-icons {
  color: black;
  vertical-align: middle;
  font-size: 20px;
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
