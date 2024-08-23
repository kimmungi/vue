<template>
  <div class="container mt-4">
    <h2>마이페이지</h2>
    <form @submit.prevent="updateProfile">
      <div class="mb-3">
        <label for="password" class="form-label">새 비밀번호</label>
        <input v-model="password" type="password" class="form-control" id="password">
      </div>
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">새 비밀번호 확인</label>
        <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword">
      </div>
      <div class="mb-3">
        <label for="district" class="form-label">지역구</label>
        <select v-model="district" class="form-select" id="district" required @change="loadCenters">
          <option value="" disabled selected>지역구 선택</option>
          <option v-for="districtOption in districts" :key="districtOption.value" :value="districtOption.value">
            {{ districtOption.name }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="center" class="form-label">센터</label>
        <select v-model="center" class="form-select" id="center" required :disabled="!district">
          <option value="" disabled selected>센터 선택</option>
          <option v-for="centerOption in centers" :key="centerOption.value" :value="centerOption.value">
            {{ centerOption.text }}
          </option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">정보 수정</button>
    </form>

    <h3 class="mt-5">즐겨찾기 용수 그룹</h3>
    <div v-if="!favorites || Object.keys(favorites).length === 0">즐겨찾기한 용수 그룹이 없습니다.</div>
    <div v-else v-for="(group, groupName) in favorites" :key="groupName" class="mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5>{{ groupName }}</h5>
        <button @click="toggleGroup(groupName)" class="btn btn-sm btn-outline-primary">
          {{ expandedGroups[groupName] ? '그룹 감추기' : '그룹 펼쳐보기' }}
        </button>
      </div>
      <ul v-if="expandedGroups[groupName]" class="list-group mt-2">
        <li v-for="hydrant in group" :key="hydrant.id" class="list-group-item d-flex justify-content-between align-items-center">
          {{ hydrant.소화용수번호 }} - {{ hydrant.새주소 }}
          <button @click="removeFromGroup(groupName, hydrant)" class="btn btn-sm btn-danger">삭제</button>
        </li>
      </ul>
    </div>

    <router-link to="/map" class="btn btn-success mt-3">용수지도로 이동</router-link>

    <button @click="showDeleteConfirmation = true" class="btn btn-danger mt-3 ml-2">회원 탈퇴</button>

    <!-- 탈퇴 확인 모달 -->
    <div v-if="showDeleteConfirmation" class="modal fade show" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">회원 탈퇴 확인</h5>
            <button @click="showDeleteConfirmation = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </div>
          <div class="modal-footer">
            <button @click="showDeleteConfirmation = false" type="button" class="btn btn-secondary">취소</button>
            <button @click="deleteAccount" type="button" class="btn btn-danger">탈퇴</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { getAuth, updatePassword, deleteUser } from 'firebase/auth'
import { getFirestore, doc, updateDoc, getDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { districtsData, centersByDistrictData } from './utils/mapData.js'

export default {
  name: 'MyPage',
  setup() {
    const auth = getAuth()
    const db = getFirestore()
    const password = ref('')
    const confirmPassword = ref('')
    const district = ref('')
    const center = ref('')
    const favorites = ref({})
    const districts = ref(districtsData)
    const centers = ref([])
    const showDeleteConfirmation = ref(false)
    const expandedGroups = reactive({})
    const userData = ref(null)

    const loadCenters = () => {
      centers.value = centersByDistrictData[district.value] || []
      // 새 지역구의 센터 목록에 현재 선택된 센터가 없는 경우에만 초기화
      if (!centers.value.some(c => c.value === center.value)) {
        center.value = ''
      }
    }

    const updateProfile = async () => {
      if (password.value !== confirmPassword.value) {
        alert('비밀번호가 일치하지 않습니다.')
        return
      }
      try {
        const user = auth.currentUser
        if (user) {
          if (password.value) {
            await updatePassword(user, password.value)
          }
          
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          const updatedData = {
            district: district.value,
            center: center.value
          }
          
          if (userDoc.exists()) {
            // 문서가 존재하면 업데이트
            await updateDoc(userDocRef, updatedData)
          } else {
            // 문서가 존재하지 않으면 새로 생성
            updatedData.email = user.email
            await setDoc(userDocRef, updatedData)
          }
          
          // userData 갱신
          userData.value = {
            ...userData.value,
            ...updatedData
          }
          
          alert('프로필이 업데이트되었습니다.')
        }
      } catch (error) {
        console.error('프로필 업데이트 오류:', error)
        alert('프로필 업데이트 중 오류가 발생했습니다.')
      }
    }

    const toggleGroup = (groupName) => {
      expandedGroups[groupName] = !expandedGroups[groupName]
    }

    const removeFromGroup = async (groupName, hydrant) => {
      if (favorites.value[groupName]) {
        favorites.value[groupName] = favorites.value[groupName].filter(h => h.id !== hydrant.id)
        if (favorites.value[groupName].length === 0) {
          delete favorites.value[groupName]
        }
        await saveFavorites()
      }
    }

    const saveFavorites = async () => {
      const user = auth.currentUser
      if (user) {
        await setDoc(doc(db, 'favorites', user.uid), { groups: favorites.value })
      }
    }

    const loadFavorites = async () => {
      const user = auth.currentUser
      if (user) {
        const favoritesDoc = await getDoc(doc(db, 'favorites', user.uid))
        favorites.value = favoritesDoc.exists() ? favoritesDoc.data().groups : {}
        Object.keys(favorites.value).forEach(groupName => {
          expandedGroups[groupName] = false
        })
      }
    }

    const deleteAccount = async () => {
      try {
        const user = auth.currentUser
        if (user) {
          await deleteDoc(doc(db, 'users', user.uid))
          await deleteDoc(doc(db, 'favorites', user.uid))
          await deleteUser(user)
          alert('회원 탈퇴가 완료되었습니다.')
          // 로그아웃 처리 및 로그인 페이지로 리다이렉트
        }
      } catch (error) {
        console.error('회원 탈퇴 오류:', error)
        alert('회원 탈퇴 중 오류가 발생했습니다.')
      }
    }

    onMounted(async () => {
      const user = auth.currentUser
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          userData.value = userDoc.data()
          district.value = userData.value.district || ''
          center.value = userData.value.center || ''
        } else {
          console.log('사용자 문서가 존재하지 않습니다. 기본값을 설정합니다.')
          userData.value = { email: user.email, district: '', center: '' }
          district.value = ''
          center.value = ''
        }
        loadCenters()
        await loadFavorites()
      }
    })

    return {
      password,
      confirmPassword,
      district,
      center,
      favorites,
      districts,
      centers,
      showDeleteConfirmation,
      expandedGroups,
      loadCenters,
      updateProfile,
      toggleGroup,
      removeFromGroup,
      deleteAccount,
      userData
    }
  }
}
</script>

<style scoped>
#register-section {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  color: #333;
}

.form-label {
  font-weight: bold;
}

.alert {
  margin-top: 15px;
}

.btn-primary {
  width: 100%;
}

.mt-3 {
  text-align: center;
}
</style>