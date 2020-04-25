<template>
  <v-text-field
    v-model="count"
    :value="value"
    :label="field.label"
    :rules="rules"
    :maxlength="inputCharLimit"
    :clearable="clearable"
    @input="$emit('input', count)"
  >
    <v-tooltip
      v-if="!!field.help"
      v-model="field.help.show"
      slot="append-outer"
      bottom
    >
      <template v-slot:activator="{}">
        <v-btn icon small @click="field.help.show = !field.help.show">
          <v-icon>help</v-icon>
        </v-btn>
      </template>
      <span>
        {{ field.help.info }}
      </span>
    </v-tooltip>
  </v-text-field>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component({})
export default class CountTextField extends Vue {
  @Prop()
  readonly field!: {
    [key: string]: {
      label: string;
      count: string;
      help?: { info: string; show: boolean };
    };
  };

  @Prop()
  readonly value!: string;

  count = "";

  readonly inputCharLimit = 3;
  readonly rules = [
    (v: any) => !!v || "This field is required",
    (v: any) =>
      (v && v.length <= this.inputCharLimit) ||
      "Input is over the character limit",
    (v: any) => (v && /^([0-9]*)$/.test(v)) || "Please input a number",
    (v: any) => (v && /^(0|[1-9][0-9]*)$/.test(v)) || "No leading zeros"
  ];
  readonly clearable = false;
}
</script>
