<template>
  <div>
    <v-btn
      v-for="act in actions"
      :key="act.desc"
      class="ml-1"
      rounded
      text
      @click="$emit(act.emit)"
      :color="act.color"
    >
      <v-icon left>{{ act.icon }}</v-icon>
      {{ act.desc }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class TopActions extends Vue {
  actions: { desc: string; icon: string; emit: string; color?: string }[] = [
    { desc: "Export", icon: "cloud_download", emit: "export" },
    { desc: "Help", icon: "help", emit: "help" },
    { desc: "Log Out", icon: "exit_to_app", emit: "logout" }
  ];
}
</script>
