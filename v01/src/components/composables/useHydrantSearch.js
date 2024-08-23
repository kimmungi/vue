// useHydrantSearch.js
import { ref } from 'vue'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

export function useHydrantSearch() {
  const db = getFirestore()
  const displayedHydrants = ref([])
  const selectedHydrants = ref([])

  const handleSearch = async (searchParams) => {
    console.log("Search params:", searchParams)
    const { district, center, query: searchQuery } = searchParams
    
    const hydrantsCollection = collection(db, 'csv_data')
    let q = query(hydrantsCollection)

    if (district) {
      const districtCode = district.padStart(2, '0')
      q = query(q, where('서소코드', '>=', districtCode + '000'), where('서소코드', '<=', districtCode + '999'))
    }

    if (center) {
      q = query(q, where('서소코드', '==', district + center))
    }

    if (searchQuery) {
      q = query(q, where('소화용수번호', '>=', searchQuery), where('소화용수번호', '<=', searchQuery + '\uf8ff'))
    }

    try {
      const querySnapshot = await getDocs(q)
      displayedHydrants.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isChecked: false
      }))
      console.log("Displayed hydrants:", displayedHydrants.value.length)
    } catch (error) {
      console.error('Error searching for hydrants:', error)
      displayedHydrants.value = []
    }
  }

  const selectHydrant = (hydrant) => {
    const index = selectedHydrants.value.findIndex(h => h.id === hydrant.id)
    if (index > -1) {
      selectedHydrants.value.splice(index, 1)
    } else {
      selectedHydrants.value.push(hydrant)
    }
  }

  const removeSelectedHydrant = (hydrant) => {
    const index = selectedHydrants.value.findIndex(h => h.id === hydrant.id)
    if (index > -1) {
      selectedHydrants.value.splice(index, 1)
    }
  }

  return {
    displayedHydrants,
    selectedHydrants,
    handleSearch,
    selectHydrant,
    removeSelectedHydrant
  }
}