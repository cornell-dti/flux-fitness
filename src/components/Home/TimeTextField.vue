<template>
  <v-col class="ma-0 pa-0" cols="6">
    <v-text-field
      :value="value"
      :rules="rules"
      :maxlength="inputCharLimit"
      :clearable="clearable"
      @input="$emit('input', $event)"
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
    (v: any) =>
      (v && /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]) (AM|PM)$/i.test(v)) ||
      "Please enter a valid time: hh:mm AM/PM",
  ];
  readonly clearable = false;
}
</script>
