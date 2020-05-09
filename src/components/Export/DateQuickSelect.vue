<template>
  <div>
    <v-btn
      v-for="opt in options"
      :key="opt.desc"
      class="mr-3 mb-2"
      rounded
      small
      outlined
      @click="$emit(opt.emit)"
      :color="opt.color || 'dark-grey'"
    >
      <v-icon v-if="opt.icon" left>{{ opt.icon }}</v-icon>
      {{ opt.desc }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component
export default class DateQuickSelect extends Vue {
  readonly options: {
    desc: string;
    icon: string;
    emit: string;
    color?: string;
  }[] = [
    { desc: "Past month", icon: "", emit: "month" },
    { desc: "Past week", icon: "", emit: "week" },
    { desc: "Yesterday", icon: "", emit: "yesterday" },
    { desc: "Today", icon: "", emit: "today" },
  ];
}
</script>
