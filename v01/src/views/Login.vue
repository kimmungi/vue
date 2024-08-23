<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <LoginForm v-if="showLogin" @showRegister="showLogin = false" @login="handleLogin" />
        <RegisterForm v-if="!showLogin" @showLogin="showLogin = true" @register="handleRegister" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'

export default {
  name: 'Login',
  components: {
    LoginForm,
    RegisterForm
  },
  setup(props, { emit }) {
    const showLogin = ref(true)

    const handleLogin = (userData) => {
      emit('login-success', userData)
    }

    const handleRegister = (userData) => {
      emit('register-success', userData)
      showLogin.value = true
    }

    return {
      showLogin,
      handleLogin,
      handleRegister
    }
  }
}
</script>