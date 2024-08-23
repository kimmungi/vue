<!-- UserInfo.vue -->
<template>
  <div id="user-info">
    <h3>사용자 정보</h3>
    <p>이메일: {{ email }}</p>
    <p>지역구: {{ district }}</p>
    <p>센터: {{ center }}</p>
    <button @click="logout" class="btn btn-secondary">로그아웃</button>
  </div>
</template>

<script>
export default {
  props: ['email', 'district', 'center'],
  methods: {
    logout() {
      this.$emit('logout');
    }
  }
}
</script>