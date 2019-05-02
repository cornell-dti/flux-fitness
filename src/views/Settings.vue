<template>
  <app-card>
    <div class="text">
      <h1>Settings</h1>
      <p>Modify settings and export data.</p>
      <p>Click "Download" to export data as an Excel spreadsheet.</p>
    </div>
    <!-- TODO: make this into a component -->
    <button class="button-boxed" v-on:click="download">
      <i class="material-icons">file_download</i>
      DOWNLOAD
    </button>
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
import Vue from "vue";
import firebase from 'firebase'; 

@Component({
  components: {
    ActionButtonGroup,
    AppCard
  }
})
export default class Settings extends Vue {
  active = false;
  handler() {
    this.$router.push({
      name: "home"
    });
  }

  download() {
      const getURL = firebase.functions().httpsCallable('getURL'); 
      let gymId = localStorage.gym.toLowerCase(); 
      if (gymId === 'helen newman') {
        gymId = 'helen_newman'; 
      }
      getURL({id: gymId})
      .then((res) => {
        const storage = firebase.storage(); 
        const gsref = storage.refFromURL(`gs:/${res.data}/${gymId}.xlsx/`); 
        gsref.getDownloadURL().then(url => {
          window.open(url); 
        }); 
      })
      .catch((err) => {
        console.log(err); 
      })

    }
}
</script>

<style lang="scss" scoped>
.text {
  padding-right: 30px;
}

.button-boxed {
  padding-right: 16px;
}

.material-icons {
  color: white;
  vertical-align: middle;
  font-size: 20px;
}
</style>
