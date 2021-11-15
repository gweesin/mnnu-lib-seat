<template>
  <div>
    <h1>seats page!</h1>
  </div>
</template>

<script>
export default {
  name: 'index',
  async asyncData({ $axios }) {
    const seats = await $axios.$get(`/get/yf/seats`);
    return { seats: seats };
  },
};
</script>

<style scoped></style>
