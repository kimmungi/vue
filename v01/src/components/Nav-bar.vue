<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="../assets/logo.png" alt="Logo" width="50" height="50" class="d-inline-block align-text-top me-2">
        용수지도
      </a>
      <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav align-items-center">
          <li class="nav-item" v-if="currentUser">
            <span class="nav-link">{{ currentUser.email }}</span>
          </li>
          <li class="nav-item" v-if="currentUser">
            <span class="nav-link">{{ districtName }} / {{ centerName }}</span>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/map">지도</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/mypage">마이페이지</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="showSuggestion">건의사항</a>
          </li>
          <li class="nav-item" v-if="currentUser">
            <button @click="logout" class="btn btn-outline-dark">로그아웃</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { districtsData, centersByDistrictData } from '@/components/utils/mapData.js'

export default {
  name: 'NavBar',
  props: {
    currentUser: Object
  },
  setup(props, { emit }) {
    const showSuggestion = () => {
      emit('show-suggestion')
    }

    const logout = () => {
      emit('logout')
    }

    const districtName = computed(() => {
      if (props.currentUser && props.currentUser.district) {
        const district = districtsData.find(d => d.value === props.currentUser.district)
        return district ? district.name : props.currentUser.district
      }
      return ''
    })

    const centerName = computed(() => {
      if (props.currentUser && props.currentUser.district && props.currentUser.center) {
        const centers = centersByDistrictData[props.currentUser.district] || []
        const center = centers.find(c => c.value === props.currentUser.center)
        return center ? center.text : props.currentUser.center
      }
      return ''
    })

    return {
      showSuggestion,
      logout,
      districtName,
      centerName
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');

.custom-navbar {
  background-color: #769ff7; /* 오렌지색 배경 */
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  padding: 0.5rem 1rem;
  font-family: 'Noto Sans KR', sans-serif;
}

.navbar-brand, .nav-link {
  color: #000000 !important; /* 검은색 글씨 */
  font-weight: 700; /* 더 굵은 글씨 */
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 1.5rem; /* 브랜드 이름 크기 증가 */
}

.nav-link {
  position: relative;
  padding: 0.5rem 1rem;
  margin: 0 0.2rem;
  font-size: 1.1rem; /* 네비게이션 링크 크기 증가 */
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #000000;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.nav-link:hover::before {
  transform: scaleX(1);
}

.btn-outline-dark {
  border-color: #000000;
  color: #000000;
  font-weight: 700;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-outline-dark:hover {
  background-color: #000000;
  color: #FFA500;
}

/* 커스텀 토글러 스타일 */
.custom-toggler {
  border-color: #000000;
}

.custom-toggler .navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0,0,0, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E");
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 992px) {
  .navbar-nav {
    background-color: #FFB732;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .nav-link::before {
    display: none;
  }

  .nav-link:hover {
    background-color: #FFA500;
  }
}
</style>