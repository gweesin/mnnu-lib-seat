<template>
  <div>
    <h1 class="text-xl font-semibold h-4">闽南师范大学占座系统</h1>
    <div class="navigations">
      <nuxt-link v-for="(nav, index) in navigations" :key="index" :to="nav.link" class="text-base">{{ nav.desc }}</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'index',
  data() {
    return {
      navigations: [
        {
          link: '/seats',
          desc: '查看座位',
        },
        {
          link: '/user',
          desc: '我的信息',
        },
      ],
    };
  },
};
</script>

<style scoped>
.navigations {
  display: flex;
}

h1 {
  margin: 10px auto;
  display: table;
}

.navigations > a {
  margin: 10px;
  padding: 5px;
  background-color: #f5f5f5;
  text-decoration: none;
  border-radius: 1rem;
  border: 1px solid #f5f5f5;
}

.navigations > a:hover {
  border: 1px solid #db1212;
  color: #333;
}
</style>
