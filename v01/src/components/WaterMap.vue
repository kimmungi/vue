<template>
  <div class="watermap-container">
    <div class="button-container">
      <button @click="toggleSearch" class="btn btn-primary me-2">
        {{ showSearch ? '검색 닫기' : '검색 열기' }}
      </button>
      <button @click="toggleSelectedSources" class="btn btn-primary">
        {{ showSelectedSources ? '용수 목록 닫기' : '용수 목록 보기' }}
      </button>
    </div>

    <SearchComponent
      v-if="showSearch"
      :districts="districts"
      :centersByDistrict="centersByDistrict"
      :initialDistrict="selectedDistrict"
      :initialCenter="selectedCenter"
      @search="handleSearch"
      @select-hydrant="handleSelectHydrant"
    />
    
    <MapComponent 
      :hydrants="displayedHydrants"
      :selectedHydrants="selectedHydrants"
      @hydrant-selected="handleHydrantSelected"
      @hydrant-updated="handleHydrantUpdated"
    />

    <div v-if="showSelectedSources" class="selected-sources-container">
      <div class="selected-sources-header">
        <h5>선택된 용수 목록</h5>
        <button @click="toggleSelectedSources" class="btn btn-sm btn-secondary">닫기</button>
      </div>
      <FavoriteGroupsComponent
        :selectedHydrants="selectedHydrants"
        :groupedSelectedHydrants="groupedSelectedHydrants"
        :expandedGroups="expandedGroups"
        @remove-hydrant="removeSelectedHydrant"
        @create-group="createFavoriteGroup"
        @toggle-group="toggleGroup"
        @show-favorites="showFavorites"
        @remove-from-group="removeFromGroup"
        @add-to-group="addToGroup"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import SearchComponent from '@/components/map/SearchComponent.vue'
import MapComponent from '@/components/map/MapComponent.vue'
import FavoriteGroupsComponent from '@/components/map/FavoriteGroupsComponent.vue'
import { districtsData, centersByDistrictData } from '@/components/utils/mapData.js'
import { useHydrantSearch } from '@/components/composables/useHydrantSearch'
import { useFavorites } from '@/components/composables/useFavorites'

export default {
  name: 'WaterMap',
  components: {
    SearchComponent,
    MapComponent,
    FavoriteGroupsComponent
  },
  setup() {
    const db = getFirestore()
    const auth = getAuth()
    const showSearch = ref(false)
    const showSelectedSources = ref(false)
    const selectedDistrict = ref('')
    const selectedCenter = ref('')

    const { 
      displayedHydrants, 
      selectedHydrants, 
      handleSearch,
      selectHydrant,
      removeSelectedHydrant 
    } = useHydrantSearch()

    const { 
      groupedSelectedHydrants, 
      expandedGroups, 
      createFavoriteGroup, 
      addToGroup, 
      removeFromGroup, 
      toggleGroup, 
      loadFavorites 
    } = useFavorites()

    const loadUserPreferences = async () => {
      const user = auth.currentUser
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          selectedDistrict.value = userData.district || ''
          selectedCenter.value = userData.center || ''
          console.log("User preferences loaded:", selectedDistrict.value, selectedCenter.value)
        }
      }
    }

    const handleSelectHydrant = (hydrant) => {
      selectHydrant(hydrant)
    }

    const handleHydrantSelected = (hydrant) => {
      handleSelectHydrant(hydrant)
    }

    const handleHydrantUpdated = (updatedHydrant) => {
      const index = displayedHydrants.value.findIndex(h => h.id === updatedHydrant.id)
      if (index !== -1) {
        displayedHydrants.value[index] = updatedHydrant
      }
    }

    const toggleSearch = () => {
      showSearch.value = !showSearch.value
    }

    const toggleSelectedSources = () => {
      showSelectedSources.value = !showSelectedSources.value
    }

    const showFavorites = (groupName) => {
      if (groupName) {
        displayedHydrants.value = groupedSelectedHydrants.value[groupName] || []
      } else {
        alert('즐겨찾기 그룹을 선택해주세요.')
      }
    }

    onMounted(async () => {
      await loadUserPreferences()
      if (selectedDistrict.value && selectedCenter.value) {
        await handleSearch({
          district: selectedDistrict.value,
          center: selectedCenter.value,
          query: ''
        })
      }
      await loadFavorites()
    })

    watch([selectedDistrict, selectedCenter], async ([newDistrict, newCenter]) => {
      if (newDistrict && newCenter) {
        await handleSearch({
          district: newDistrict,
          center: newCenter,
          query: ''
        })
      }
    })

    return {
      districts: districtsData,
      centersByDistrict: centersByDistrictData,
      displayedHydrants,
      selectedHydrants,
      showSearch,
      showSelectedSources,
      selectedDistrict,
      selectedCenter,
      groupedSelectedHydrants,
      expandedGroups,
      handleSearch,
      handleSelectHydrant,
      handleHydrantSelected,
      handleHydrantUpdated,
      removeSelectedHydrant,
      toggleSearch,
      toggleSelectedSources,
      createFavoriteGroup,
      addToGroup,
      removeFromGroup,
      toggleGroup,
      showFavorites,
    }
  }
}
</script>

<style scoped>
.watermap-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.button-container {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.search-component {
  position: absolute;
  top: 60px;
  left: 10px;
  z-index: 1000;
}

.selected-sources-container {
  position: absolute;
  top: 60px;
  right: 10px;
  z-index: 1000;
  max-width: 300px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.selected-sources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.selected-sources-header h5 {
  margin: 0;
}
</style>