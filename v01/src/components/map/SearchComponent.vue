<template>
  <div id="search-container" class="shadow p-3 mb-3 bg-white rounded">
    <h4 class="mb-3">소화전 검색</h4>
    <select v-model="selectedDistrict" @change="loadCenters" class="form-select mb-2">
      <option value="">지역구 선택</option>
      <option v-for="district in districts" :key="district.value" :value="district.value">
        {{ district.name }}
      </option>
    </select>
    <select v-model="selectedCenter" class="form-select mb-2" :disabled="!selectedDistrict">
      <option value="">센터 선택</option>
      <option v-for="center in centers" :key="center.value" :value="center.value">
        {{ center.text }}
      </option>
    </select>
    <div class="input-group mb-2">
      <input type="text" v-model="searchQuery" @input="onSearchInput" class="form-control" placeholder="소화용수번호 검색">
      <button class="btn btn-primary" @click="searchFirehydrant">검색</button>
    </div>
    <div v-if="searchResults.length > 0" class="search-results">
      <ul class="list-group">
        <li v-for="result in searchResults" :key="result.id" @click="selectHydrant(result)" class="list-group-item list-group-item-action">
          {{ result.소화용수번호 }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

export default {
  name: 'SearchComponent',
  props: {
    districts: Array,
    centersByDistrict: Object,
    initialDistrict: String,
    initialCenter: String
  },
  emits: ['search', 'select-hydrant'],
  setup(props, { emit }) {
    const db = getFirestore()
    const selectedDistrict = ref('')
    const selectedCenter = ref('')
    const searchQuery = ref('')
    const centers = ref([])
    const searchResults = ref([])

    const loadCenters = () => {
      centers.value = props.centersByDistrict[selectedDistrict.value] || []
      if (!centers.value.some(center => center.value === selectedCenter.value)) {
        selectedCenter.value = ''
      }
    }

    const onSearchInput = async () => {
      if (searchQuery.value.length < 1) {
        searchResults.value = []
        return
      }

      const csvDataCollection = collection(db, 'csv_data')
      const lowercaseQuery = searchQuery.value.toLowerCase()

      let q = query(csvDataCollection)

      if (selectedDistrict.value) {
        const districtCode = selectedDistrict.value.padStart(2, '0')
        q = query(q, 
          where('서소코드', '>=', districtCode + '000'),
          where('서소코드', '<=', districtCode + '999')
        )
      }

      if (selectedCenter.value) {
        q = query(q, where('서소코드', '==', selectedDistrict.value + selectedCenter.value))
      }

      try {
        const querySnapshot = await getDocs(q)
        searchResults.value = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(hydrant => hydrant.소화용수번호.toLowerCase().includes(lowercaseQuery))
          .slice(0, 10)
      } catch (error) {
        console.error('Error searching for hydrants:', error)
        searchResults.value = []
      }
    }

    const searchFirehydrant = () => {
      if (!selectedDistrict.value) {
        alert('먼저 지역구를 선택해주세요.')
        return
      }

      emit('search', {
        district: selectedDistrict.value,
        center: selectedCenter.value,
        query: searchQuery.value
      })
    }

    const selectHydrant = (hydrant) => {
      emit('select-hydrant', hydrant)
      searchQuery.value = hydrant.소화용수번호
      searchResults.value = []
    }

    onMounted(() => {
      console.log("Initial values:", props.initialDistrict, props.initialCenter)
      selectedDistrict.value = props.initialDistrict || ''
      selectedCenter.value = props.initialCenter || ''
      loadCenters()
      if (selectedDistrict.value && selectedCenter.value) {
        searchFirehydrant()
      }
    })

    watch(() => props.initialDistrict, (newVal) => {
      selectedDistrict.value = newVal
      loadCenters()
    })

    watch(() => props.initialCenter, (newVal) => {
      selectedCenter.value = newVal
    })

    return {
      selectedDistrict,
      selectedCenter,
      searchQuery,
      centers,
      searchResults,
      loadCenters,
      onSearchInput,
      searchFirehydrant,
      selectHydrant
    }
  }
}
</script>

<style scoped>
.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>