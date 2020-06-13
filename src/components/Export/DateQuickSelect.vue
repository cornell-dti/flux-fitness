<template>
  <div>
    <span v-for="opt in options" :key="opt.desc">
      <br v-if="opt.lineBreak" />

      <v-btn
        v-else
        class="mr-3 mb-2"
        rounded
        small
        @click="quickSelect(opt.emit)"
        :color="opt.color || 'blue-grey darken-1'"
        :depressed="opt.emit === getSelected()"
        :outlined="opt.emit !== getSelected()"
        dark
      >
        <v-icon v-if="opt.icon" left>{{ opt.icon }}</v-icon>
        {{ opt.desc }}
      </v-btn>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import moment from "moment";

@Component
export default class DateQuickSelect extends Vue {
  @Prop({ default: false })
  readonly edited!: boolean;

  readonly prevMonth = moment.months(new Date().getMonth() - 1);

  readonly thisWeek = moment().startOf("week").format("MM/DD");

  readonly lastWeek = moment()
    .startOf("week")
    .subtract(1, "weeks")
    .format("MM/DD");

  readonly options: (
    | {
        desc: string;
        icon: string;
        emit: string;
        color?: string;
      }
    | { lineBreak: boolean }
  )[] = [
    { desc: `Week of ${this.thisWeek}`, icon: "", emit: "thisWeek" },
    { desc: `Week of ${this.lastWeek}`, icon: "", emit: "lastWeek" },
    { lineBreak: true },
    { desc: "Week to date", icon: "", emit: "weekToDate" },
    { desc: "Month to date", icon: "", emit: "monthToDate" },
    { desc: this.prevMonth, icon: "", emit: "prevMonth" },
  ];

  selected = "thisWeek";

  /**
   * Gets the selected option or returns empty string if user manually edited
   * the date.
   */
  getSelected(): string {
    return this.edited ? "" : this.selected;
  }

  /**
   * Sets and emits the selected option
   */
  quickSelect(selected: string): void {
    this.selected = selected;
    this.$emit("select", selected);
  }
}
</script>
