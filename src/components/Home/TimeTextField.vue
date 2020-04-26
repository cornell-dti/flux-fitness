<template>
  <v-col class="ma-0 pa-0" cols="6">
    <v-text-field
      :value="value"
      :rules="rules"
      :maxlength="inputCharLimit"
      :clearable="clearable"
      @input="updateTime($event)"
    >
      <div class="d-flex align-center" slot="prepend">
        <v-progress-circular
          :rotate="-90"
          :size="25"
          :width="3"
          :value="(seconds * 5) / 3"
        >
          <v-icon :size="20" color="black">schedule</v-icon>
        </v-progress-circular>
      </div>
      <v-tooltip slot="append" bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon small :disabled="resetDisabled" @click="$emit('reset')">
            <v-icon v-on="on">restore</v-icon>
          </v-btn>
        </template>
        <span>Reset time to the current time</span>
      </v-tooltip>
    </v-text-field>
  </v-col>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import moment from "moment";

@Component({})
export default class TimeTextField extends Vue {
  @Prop()
  readonly value!: string;

  @Prop()
  readonly seconds!: number;

  @Prop()
  readonly resetDisabled!: boolean;

  readonly inputCharLimit = 8;
  readonly rules = [
    (v: any) => !!v || "This field is required",
    (v: any) =>
      (v && v.length <= this.inputCharLimit) ||
      "Input is over the character limit",
    (v: any) => this.validTime(v) || "Please enter a valid time",
    (v: any) =>
      this.validTimeDiff(v) ||
      "Only times within the past 30 minutes are valid",
  ];
  readonly clearable = false;

  updateTime(value: string): void {
    if (this.validTime(value) && this.validTimeDiff(value)) {
      this.$emit("input", value);
    }
  }

  validTime(value: any): boolean {
    return moment(
      `${moment().format("YYYY-MM-DD")} ${value}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"],
      true
    ).isValid();
  }

  validTimeDiff(value: any): boolean {
    const momentTime = moment(
      `${moment().format("YYYY-MM-DD")} ${value.toLowerCase()}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm"],
      true
    );
    if (momentTime.isValid()) {
      const diff = moment().diff(momentTime, "minutes");
      return diff <= 30 && diff >= 0;
    }
    return false;
  }
}
</script>
