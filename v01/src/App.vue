<template>
  <div id="app">
    <Navbar 
      :currentUser="currentUser" 
      @show-suggestion="showSuggestion" 
      @logout="logout"
    />

    <div class="router-view-container" style="margin-top: 0px;">
      <router-view 
        @login-success="handleLoginSuccess" 
        @register-success="handleRegisterSuccess"
      ></router-view>
    </div>

    <SuggestionModal @submit-suggestion="submitSuggestion" />
  </div>
</template>

<script>
import { getAuth, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import Navbar from '@/components/Nav-bar.vue'
import SuggestionModal from '@/components/SuggestionModal.vue'

export default {
  components: {
    Navbar,
    SuggestionModal
  },
  data() {
    return {
      currentUser: null,
      db: null
    }
  },
  created() {
    const auth = getAuth()
    this.db = getFirestore()
    auth.onAuthStateChanged(this.handleAuthStateChanged)
  },
  methods: {
    async handleAuthStateChanged(user) {
      if (user) {
        const userDoc = await getDoc(doc(this.db, 'users', user.uid))
        this.currentUser = { ...user, ...userDoc.data() }
        if (this.$route.path === '/') {
          this.$router.push('/map')
        }
      } else {
        this.currentUser = null
        this.$router.push('/')
      }
    },
    handleLoginSuccess(user) {
      this.$router.push('/map')
    },
    handleRegisterSuccess(user) {
      this.$router.push('/map')
    },
    async logout() {
      try {
        await signOut(getAuth())
        this.currentUser = null
        this.$router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    },
    showSuggestion() {
      if (typeof bootstrap !== 'undefined') {
        new bootstrap.Modal(document.getElementById('suggestionModal')).show()
      }
    },
    submitSuggestion(suggestion) {
      console.log('Submitted suggestion:', suggestion)
      // 여기에 건의사항을 처리하는 로직을 추가할 수 있습니다.
      // 예: Firestore에 저장
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.router-view-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

body {
  margin: 0;
  padding: 0;
}
</style>