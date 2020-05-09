<template>
  <div>
    <v-btn
      v-for="opt in options"
      :key="opt.desc"
      class="mr-3 mb-2"
      rounded
      small
      outlined
      @click="$emit('select', opt.emit)"
      :color="opt.color || 'blue-grey darken-1'"
    >
      <v-icon v-if="opt.icon" left>{{ opt.icon }}</v-icon>
      {{ opt.desc }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import moment from "moment";

@Component
export default class DateQuickSelect extends Vue {
  readonly prevMonth = moment.months(new Date().getMonth() - 1);
  readonly thisWeek = moment().startOf("week").format("MM/DD");
  readonly lastWeek = moment()
    .startOf("week")
    .subtract(1, "weeks")
    .format("MM/DD");

  readonly options: {
    desc: string;
    icon: string;
    emit: string;
    color?: string;
  }[] = [
    { desc: `Week of ${this.thisWeek}`, icon: "", emit: "thisWeek" },
    { desc: `Week of ${this.lastWeek}`, icon: "", emit: "lastWeek" },
    { desc: "Week to date", icon: "", emit: "weekToDate" },
    { desc: "Month to date", icon: "", emit: "monthToDate" },
    { desc: this.prevMonth, icon: "", emit: "prevMonth" },
  ];
}
</script>
