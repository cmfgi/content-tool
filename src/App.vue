<template>
  <MainComponent/>
</template>
<script lang="ts">

//we know that our cookies are now filled with our credentials. It's time to
//query for the issues, resolve the issues and start to
import MainComponent from "@/components/MainComponent.vue";

export default {
  components: {
    MainComponent
  }
}
</script>

<style scoped>
#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-radius: var(--border-radius);
  color: var(--gray-700);
  padding: 4rem;
}
</style>