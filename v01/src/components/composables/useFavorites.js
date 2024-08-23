import { ref, reactive } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

export function useFavorites() {
  const db = getFirestore()
  const groupedSelectedHydrants = ref({})
  const expandedGroups = reactive({})

  const createFavoriteGroup = async (newGroupName) => {
    if (newGroupName) {
      groupedSelectedHydrants.value[newGroupName] = []
      expandedGroups[newGroupName] = true
      await saveFavorites()
    }
  }

  const addToGroup = async ({ groupName, hydrant }) => {
    if (hydrant && !groupedSelectedHydrants.value[groupName].some(h => h.id === hydrant.id)) {
      groupedSelectedHydrants.value[groupName].push(hydrant)
      await saveFavorites()
    }
  }

  const removeFromGroup = async ({ groupName, hydrant }) => {
    if (groupedSelectedHydrants.value[groupName]) {
      groupedSelectedHydrants.value[groupName] = groupedSelectedHydrants.value[groupName].filter(h => h.id !== hydrant.id)
      if (groupedSelectedHydrants.value[groupName].length === 0) {
        delete groupedSelectedHydrants.value[groupName]
      }
      await saveFavorites()
    }
  }

  const toggleGroup = (groupName) => {
    expandedGroups[groupName] = !expandedGroups[groupName]
  }

  const saveFavorites = async () => {
    const auth = getAuth()
    if (auth.currentUser) {
      await setDoc(doc(db, 'favorites', auth.currentUser.uid), { groups: groupedSelectedHydrants.value })
    }
  }

  const loadFavorites = async () => {
    const auth = getAuth()
    if (auth.currentUser) {
      const favoritesDoc = await getDoc(doc(db, 'favorites', auth.currentUser.uid))
      if (favoritesDoc.exists()) {
        groupedSelectedHydrants.value = favoritesDoc.data().groups || {}
        Object.keys(groupedSelectedHydrants.value).forEach(key => {
          expandedGroups[key] = false
        })
      }
    }
  }

  return {
    groupedSelectedHydrants,
    expandedGroups,
    createFavoriteGroup,
    addToGroup,
    removeFromGroup,
    toggleGroup,
    saveFavorites,
    loadFavorites
  }
}