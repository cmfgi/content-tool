<template>
  <div class="flex flex-row flex-wrap" v-for="(value, key) in issues"
       v-bind:key="key">
    <IssueCounter v-bind:issue="value" v-bind:name="key"/>
  </div>
</template>
<script>

import {ipcRenderer} from "electron";
import IssueCounter from "@/components/IssueCounter.vue";
import {IssueConstants} from "@/constants/IssueConstants";

export default {
  name: "MainComponent",
  components: {
    IssueCounter
  },
  data() {

    return {
      issues: this.$store.issues
    }
  },

  mounted() {
    // eslint-disable-next-line no-unused-vars
    this.issues = this.$store.issues;
    ipcRenderer.send(IssueConstants.RESOLVE_ISSUES);
    ipcRenderer.on(IssueConstants.ISSUES_SEND, (sender, data) => {
      console.log("received issues " + JSON.stringify(data) + " " + JSON.stringify(data["dead_link"]));
      this.$data.issues = data;
    });
  }
}
</script>