<template>
  <v-menu
    v-model="dateMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    min-width="18rem"
    :disabled="readonly"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="formattedValue"
        :label="label"
        :class="spacing"
        readonly
        v-on="on"
      >
        <template v-slot:prepend>
          <v-icon color="black">{{ prependIcon }}</v-icon>
        </template>
      </v-text-field>
    </template>
    <v-date-picker
      :value="value"
      :readonly="readonly"
      @input="updateDate($event)"
    />
  </v-menu>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop, Component } from "vue-property-decorator";
import moment from "moment";

@Component
export default class DatePickerMenu extends Vue {
  @Prop()
  readonly value!: string;

  @Prop({ default: "Default label" })
  readonly label!: string;

  @Prop({ default: "" })
  readonly spacing!: string;

  @Prop({ default: false })
  readonly readonly!: boolean;

  @Prop()
  readonly prependIcon!: string;

  dateMenu = false;

  get formattedValue(): string {
    const date = moment(this.value, ["YYYY-MM-DD"], true);
    if (!date.isValid()) return "";
    return date.format("MM/DD/YYYY");
  }

  /**
   * Emits the date in the format YYYY-MM-DD and closes the date picker
   */
  updateDate(value: string): void {
    this.dateMenu = false;
    this.$emit("input", value);
  }
}
</script>
