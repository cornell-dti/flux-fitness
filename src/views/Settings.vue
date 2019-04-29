<template>
  <app-card>
    <div class="text">
      <h1>Settings</h1>
      <p>Modify settings and export data.</p>
      <p></p>
    </div>
    <action-button-group
      :require-confirmation="true"
      v-on:submitted="handler()"
      action-button-text="SAVE"
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
}
</script>

<style lang="scss" scoped>
.text {
  padding-right: 30px;
}
</style>
