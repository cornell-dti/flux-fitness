<template>
  <v-row>
    <div v-for="act in actions" :key="act.desc">
      <v-btn class="mr-1" rounded text @click="$emit(act.emit)">
        <v-icon left>{{ act.icon }}</v-icon>
        {{ act.desc }}
      </v-btn>
    </div>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class TopActions extends Vue {
  actions: { desc: string; icon: string; emit: string }[] = [
    { desc: "Export", icon: "cloud_download", emit: "export" },
    { desc: "Help", icon: "help", emit: "help" },
    { desc: "Log Out", icon: "exit_to_app", emit: "logout" }
  ];
}
</script>
