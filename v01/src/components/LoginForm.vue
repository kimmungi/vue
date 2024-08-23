<template>
  <div id="login-section">
    <h2 class="mb-4">로그인</h2>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="email" class="form-label">이메일</label>
        <input v-model="email" type="email" class="form-control" id="email" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">비밀번호</label>
        <input v-model="password" type="password" class="form-control" id="password" required>
      </div>
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>
      <button type="submit" class="btn btn-primary w-100">로그인</button>
    </form>
    <div class="mt-3 d-flex justify-content-between">
      <a href="#" @click.prevent="forgotId">아이디 찾기</a>
      <a href="#" @click.prevent="forgotPassword">비밀번호 찾기</a>
    </div>
    <div class="mt-3">
      계정이 없으신가요? <button @click="$emit('showRegister')" class="btn btn-link">회원가입</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

export default {
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const auth = getAuth()
    const db = getFirestore()

    const login = async () => {
      errorMessage.value = ''
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
        emit('login-success', userCredential.user)
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = getErrorMessage(error.code)
      }
    }

    const forgotId = async () => {
      const email = prompt('가입 시 사용한 이메일을 입력해주세요:')
      if (email) {
        try {
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('email', '==', email))
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            alert('해당 이메일로 가입된 계정이 있습니다. 이 이메일로 로그인해주세요.')
          } else {
            alert('해당 이메일로 가입된 계정을 찾을 수 없습니다.')
          }
        } catch (error) {
          console.error('Error finding account:', error)
          alert('계정 찾기 중 오류가 발생했습니다.')
        }
      }
    }

    const forgotPassword = async () => {
      const email = prompt('가입 시 사용한 이메일을 입력해주세요:')
      if (email) {
        try {
          await sendPasswordResetEmail(auth, email)
          alert('비밀번호 재설정 링크를 이메일로 발송했습니다. 이메일을 확인해주세요.')
        } catch (error) {
          console.error('Error sending password reset email:', error)
          alert('비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.')
        }
      }
    }

    const getErrorMessage = (errorCode) => {
      switch(errorCode) {
        case 'auth/user-not-found':
          return '등록되지 않은 이메일입니다.'
        case 'auth/wrong-password':
          return '비밀번호가 올바르지 않습니다.'
        case 'auth/invalid-credential':
          return '이메일 또는 비밀번호가 올바르지 않습니다.'
        default:
          return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
      }
    }

    return {
      email,
      password,
      errorMessage,
      login,
      forgotId,
      forgotPassword
    }
  }
}
</script>

<style scoped>
#login-section {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>