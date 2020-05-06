<template>
  <v-dialog :value="value" max-width="350" @click:outside="exitDialog()">
    <v-card>
      <v-card-title>Confirm Submission</v-card-title>
      <v-card-text>{{ confirm }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="exitDialog()">Edit</v-btn>
<<<<<<< HEAD
        <v-btn text color="green" @click="exitDialog();submit()">Confirm</v-btn>
=======
        <v-btn
          text
          color="green"
          @click="
            exitDialog();
            submit();
          "
        >
          Confirm
        </v-btn>
>>>>>>> afc44c88a20c4dec35a9d3ce8d8ee9407ac163d5
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

  @Prop({ default: "Confirm" })
  readonly confirm!: string;

  exitDialog() {
    this.$emit("input", false);
  }

  submit() {
<<<<<<< HEAD
    this.$emit("submit")
=======
    this.$emit("submit");
>>>>>>> afc44c88a20c4dec35a9d3ce8d8ee9407ac163d5
  }
}
</script>
