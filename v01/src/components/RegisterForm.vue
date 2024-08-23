<template>
  <div id="register-section">
    <h2 class="mb-4">회원가입</h2>
    <form @submit.prevent="register">
      <div class="mb-3">
        <label for="reg-email" class="form-label">이메일</label>
        <div class="input-group">
          <input v-model="email" type="email" class="form-control" id="reg-email" required>
          <button @click.prevent="sendVerificationEmail" class="btn btn-outline-secondary" type="button" :disabled="!email || emailSent">인증 메일 발송</button>
        </div>
      </div>
      <div class="mb-3" v-if="emailSent">
  <label for="verification-code" class="form-label">인증 코드</label>
  <div class="input-group">
    <input v-model="verificationCode" type="text" class="form-control" id="verification-code" required>
    <button @click.prevent="verifyCode" class="btn btn-outline-secondary" type="button">인증하기</button>
  </div>
</div>
      <div class="mb-3">
        <label for="reg-password" class="form-label">비밀번호</label>
        <input v-model="password" type="password" class="form-control" id="reg-password" required>
      </div>
      <div class="mb-3">
        <label for="reg-password-confirm" class="form-label">비밀번호 확인</label>
        <input v-model="passwordConfirm" type="password" class="form-control" id="reg-password-confirm" required>
      </div>
      <div class="mb-3">
        <label for="district" class="form-label">지역구</label>
        <select v-model="district" class="form-select" id="district" required @change="loadCenters">
          <option value="" disabled selected>지역구 선택</option>
          <option v-for="district in districts" :key="district.value" :value="district.value">{{ district.name }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="center" class="form-label">센터</label>
        <select v-model="center" class="form-select" id="center" required :disabled="!district">
          <option value="" disabled selected>센터 선택</option>
          <option v-for="center in centers" :key="center.value" :value="center.value">{{ center.text }}</option>
        </select>
      </div>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid">회원가입</button>
    </form>
    <div class="mt-3">
      이미 계정이 있으신가요? <button @click="$emit('showLogin')" class="btn btn-link">로그인</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { districtsData, centersByDistrictData } from '@/components/utils/mapData.js'

export default {
  emits: ['register-success', 'showLogin'],
  setup(props, { emit }) {
    const auth = getAuth()
    const db = getFirestore()
    const email = ref('')
    const password = ref('')
    const passwordConfirm = ref('')
    const district = ref('')
    const center = ref('')
    const errorMessage = ref('')
    const districts = ref(districtsData)
    const centers = ref([])
    const emailSent = ref(false)
    const verificationCode = ref('')
    const isVerified = ref(false)
    const actualVerificationCode = ref('')

    const loadCenters = () => {
      centers.value = centersByDistrictData[district.value] || []
      center.value = ''
    }

    const sendVerificationEmail = async () => {
      if (!email.value) {
        errorMessage.value = '이메일을 입력해주세요.'
        return
      }
      // 실제 구현에서는 서버에서 이메일을 보내고 인증 코드를 생성해야 합니다.
      // 여기서는 간단한 예시로 랜덤 코드를 생성합니다.
      actualVerificationCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
      console.log('Verification code:', actualVerificationCode.value) // 실제 구현에서는 제거해야 합니다.
      alert(`인증 코드가 이메일로 발송되었습니다. (테스트용 코드: ${actualVerificationCode.value})`)
      emailSent.value = true
    }

    const verifyCode = () => {
  if (verificationCode.value === actualVerificationCode.value) {
    isVerified.value = true
    alert('이메일이 인증되었습니다.')
  } else {
    errorMessage.value = '인증 코드가 일치하지 않습니다.'
  }
}

    const isFormValid = computed(() => {
  console.log('Email:', !!email.value)
  console.log('Password:', !!password.value)
  console.log('Password Confirm:', !!passwordConfirm.value)
  console.log('District:', !!district.value)
  console.log('Center:', !!center.value)
  console.log('Is Verified:', isVerified.value)
  console.log('Passwords Match:', password.value === passwordConfirm.value)

  return email.value && 
         password.value && 
         passwordConfirm.value && 
         district.value && 
         center.value && 
         isVerified.value && 
         password.value === passwordConfirm.value
})

    const register = async () => {
      if (!isFormValid.value) {
        errorMessage.value = '모든 필드를 올바르게 입력해주세요.'
        return
      }
      errorMessage.value = ''
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
        const user = userCredential.user
        await setDoc(doc(db, "users", user.uid), {
          email: email.value,
          district: district.value,
          center: center.value
        })
        emit('register-success', user)
      } catch (error) {
        console.error('Registration error:', error)
        errorMessage.value = getErrorMessage(error.code)
      }
    }

    const getErrorMessage = (errorCode) => {
      switch(errorCode) {
        case 'auth/email-already-in-use':
          return '이미 사용 중인 이메일입니다.'
        case 'auth/invalid-email':
          return '유효하지 않은 이메일 주소입니다.'
        case 'auth/weak-password':
          return '비밀번호가 너무 약합니다.'
        default:
          return '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
      }
    }

    return {
      email,
      password,
      passwordConfirm,
      district,
      center,
      errorMessage,
      districts,
      centers,
      emailSent,
      verificationCode,
      isVerified,
      isFormValid,
      loadCenters,
      sendVerificationEmail,
      verifyCode,
      register
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
</style>