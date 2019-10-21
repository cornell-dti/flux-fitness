<template>
  <app-card>
    <div class="text">
      <h1>Export</h1>
      <p>Export data.</p>
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
    <div id="error"> {{error}} </div> 
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
  start_date = "";
  end_date = "";
  error = ""; 

  handler() {
    this.$router.push({
      name: "home"
    });
  }

  download() {
    this.error = ""; 
    if (this.start_date === "" || this.end_date === "") {
      this.error = "Please enter valid dates."; 
      return; 
    }
    this.downloading = true;
    const getURL = firebase.functions().httpsCallable("getURL");
    let gymId = localStorage.gym.toLowerCase();
    if (gymId === "helen newman") {
      gymId = "helen_newman";
    }
    getURL({ id: gymId, startDate: this.start_date, endDate: this.end_date })
      .then(res => {
        this.downloading = false;
        const storage = firebase.storage();
        const gsref = storage.refFromURL(`gs:/${res.data}/${gymId}.xlsx/`);
        gsref.getDownloadURL().then(url => {
          window.open(url);
        });
      })
      .catch(err => {
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

#error {
  padding-top: 15px; 
  text-align: left;
  margin-bottom: 10px;
  color: #fa4735;
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