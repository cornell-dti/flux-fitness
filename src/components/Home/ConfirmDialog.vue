<template>
  <v-dialog :value="value" max-width="350">
    <v-card>
      <v-card-title>Confirm Submission</v-card-title>
      <v-card-text>{{ confirm }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="exitDialog()">Edit</v-btn>
        <v-btn text color="green" @click="exitDialog()">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

@Component({})
export default class ConfirmDialog extends Vue {
  @Prop({ default: false })
  readonly value!: boolean;

  @Prop({ default: "Default confirmation message" })
  readonly confirm!: string;

  exitDialog() {
    this.$emit("input", false);
  }

  // TODO: create methods for submit
}
</script>
