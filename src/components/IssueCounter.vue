<template>
  <div class="flex align-items-center justify-content-center w-8rem h-4rem bg-primary font-bold border-round m-2">
    {{name}}
  </div>
  <div class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2">
    {{issue.length}}
  </div>
  <div class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2">
    <Button text="Resolve" v-on:click="handleClick"></Button>
  </div>
</template>
<script lang="ts">
import {defineComponent, toRaw} from 'vue'
import {ipcRenderer} from "electron";
import {IssueConstants} from "@/constants/IssueConstants";
export default defineComponent({
  props: {
    issue: Array,
    name:String
  },
  methods:{
    handleClick: function (){
      if (this.name === 'dead_link'){
        ipcRenderer.send(IssueConstants.FIX_DEAD_LINKS,toRaw(this.$props.issue));

      }
    }
  }
})


</script>