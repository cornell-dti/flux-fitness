<template>
  <app-card>
    <div class="text">
      <h1>Settings</h1>
      <p>Modify settings and export data.</p>
      <p>Click "Download" to export data as an Excel spreadsheet.</p>
    </div>
    <!-- TODO: make this into a component -->
    <button class="button-boxed" v-on:click="download()">
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
    // download or something
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
