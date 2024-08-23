<template>
  <div id="map" class="full-screen-map"></div>
  <input type="file" ref="fileInput" @change="uploadImage" style="display: none;">
  <div v-if="showLargeImage" class="large-image-overlay" @click="closeLargeImage">
    <img :src="largeImageUrl" alt="Large hydrant image" class="large-image">
  </div>
</template>

<script>
import { onMounted, watch, ref } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { storage } from '@/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'MapComponent',
  props: {
    hydrants: Array,
    selectedHydrants: {
      type: Array,
      default: () => []
    }
  },
  emits: ['hydrant-selected', 'hydrant-updated'],
  setup(props, { emit }) {
    const map = ref(null)
    const markers = ref([])
    const infowindow = ref(null)
    const db = getFirestore()
    const auth = getAuth()
    let activeMarker = null
    let originalPosition = null
    let isMovingMarker = false
    const showLargeImage = ref(false)
    const largeImageUrl = ref('')
    const activeHydrant = ref(null)
    const fileInput = ref(null)

    const initializeKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        initMap()
      } else {
        const script = document.createElement('script')
        script.onload = () => window.kakao.maps.load(initMap)
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.VUE_APP_KAKAO_MAP_API_KEY}`
        document.head.appendChild(script)
      }
    }

    const initMap = () => {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 8
      }
      map.value = new window.kakao.maps.Map(container, options)
      infowindow.value = new window.kakao.maps.InfoWindow({ zIndex: 1 })

      window.kakao.maps.event.addListener(map.value, 'click', () => {
        if (!isMovingMarker) {
          infowindow.value.close()
        }
      })
    }

    const addMarker = (hydrant) => {
      const position = new window.kakao.maps.LatLng(parseFloat(hydrant.위도), parseFloat(hydrant.경도))
      const marker = new window.kakao.maps.Marker({ position, draggable: false })
      
      window.kakao.maps.event.addListener(marker, 'click', () => {
        showInfoWindow(marker, hydrant)
      })

      marker.setMap(map.value)
      markers.value.push(marker)
    }

    const showInfoWindow = (marker, hydrant) => {
      const isSelected = props.selectedHydrants.some(h => h.id === hydrant.id)
      const content = `
        <div style="padding: 15px; max-width: 300px;">
          <h3 style="margin-top: 0;">소화용수번호: ${hydrant.소화용수번호}</h3>
          <img src="${hydrant.imageUrl || '/placeholder-image.jpg'}" alt="Hydrant image" style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;" id="hydrantImage">
          <p>사용구분: ${hydrant.사용구분}</p>
          <p>위도: <span id="lat">${hydrant.위도}</span></p>
          <p>경도: <span id="lng">${hydrant.경도}</span></p>
          <button id="uploadImageButton" class="btn btn-info">이미지 업로드</button>
          <button id="moveMarkerButton" class="btn btn-warning">마커 이동</button>
          <button id="savePositionButton" class="btn btn-success" style="display: none;">저장하기</button>
          <button id="cancelMoveButton" class="btn btn-danger" style="display: none;">취소</button>
          <button id="selectButton" class="btn ${isSelected ? 'btn-warning' : 'btn-primary'}">
            ${isSelected ? '선택 해제' : '선택하기'}
          </button>
        </div>
      `
      infowindow.value.setContent(content)
      infowindow.value.open(map.value, marker)

      setTimeout(() => {
        const hydrantImage = document.getElementById('hydrantImage')
        const uploadImageButton = document.getElementById('uploadImageButton')
        const moveMarkerButton = document.getElementById('moveMarkerButton')
        const savePositionButton = document.getElementById('savePositionButton')
        const cancelMoveButton = document.getElementById('cancelMoveButton')
        const selectButton = document.getElementById('selectButton')
        
        if (hydrantImage) {
          hydrantImage.addEventListener('click', () => {
            showLargeImage.value = true
            largeImageUrl.value = hydrant.imageUrl || '/placeholder-image.jpg'
            activeHydrant.value = hydrant
          })
        }

        if (uploadImageButton) {
          uploadImageButton.addEventListener('click', () => {
            activeHydrant.value = hydrant
            fileInput.value.click()
          })
        }

        if (moveMarkerButton) {
          moveMarkerButton.addEventListener('click', () => {
            activeMarker = marker
            originalPosition = marker.getPosition()
            marker.setDraggable(true)
            isMovingMarker = true
            moveMarkerButton.style.display = 'none'
            savePositionButton.style.display = 'inline-block'
            cancelMoveButton.style.display = 'inline-block'
            selectButton.style.display = 'none'

            window.kakao.maps.event.addListener(marker, 'dragend', updateInfoWindow)
          })
        }

        if (savePositionButton) {
          savePositionButton.addEventListener('click', () => {
            saveNewPosition(hydrant, marker.getPosition())
            finishMovingMarker(moveMarkerButton, savePositionButton, cancelMoveButton, selectButton)
          })
        }

        if (cancelMoveButton) {
          cancelMoveButton.addEventListener('click', () => {
            marker.setPosition(originalPosition)
            updateInfoWindow()
            finishMovingMarker(moveMarkerButton, savePositionButton, cancelMoveButton, selectButton)
          })
        }

        if (selectButton) {
          selectButton.addEventListener('click', () => {
            emit('hydrant-selected', hydrant)
            infowindow.value.close()
          })
        }
      }, 100)
    }

    const updateInfoWindow = () => {
      const latSpan = document.getElementById('lat')
      const lngSpan = document.getElementById('lng')
      if (latSpan && lngSpan && activeMarker) {
        const position = activeMarker.getPosition()
        latSpan.textContent = position.getLat().toFixed(6)
        lngSpan.textContent = position.getLng().toFixed(6)
      }
    }

    const finishMovingMarker = (moveButton, saveButton, cancelButton, selectButton) => {
      activeMarker.setDraggable(false)
      isMovingMarker = false
      moveButton.style.display = 'inline-block'
      saveButton.style.display = 'none'
      cancelButton.style.display = 'none'
      selectButton.style.display = 'inline-block'
      window.kakao.maps.event.removeListener(activeMarker, 'dragend', updateInfoWindow)
    }

    const saveNewPosition = async (hydrant, newPosition) => {
      const user = auth.currentUser
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      const updatedHydrant = {
        ...hydrant,
        위도: newPosition.getLat().toFixed(6),
        경도: newPosition.getLng().toFixed(6),
        lastModifiedBy: user.email,
        lastModifiedAt: new Date().toISOString()
      }

      try {
        await updateDoc(doc(db, 'csv_data', hydrant.id), updatedHydrant)
        emit('hydrant-updated', updatedHydrant)
        alert('위치가 성공적으로 업데이트되었습니다.')
      } catch (error) {
        console.error('Error updating hydrant:', error)
        alert('위치 업데이트에 실패했습니다.')
        if (activeMarker && originalPosition) {
          activeMarker.setPosition(originalPosition)
          updateInfoWindow()
        }
      }
    }

    const clearMarkers = () => {
      markers.value.forEach(marker => marker.setMap(null))
      markers.value = []
    }

    const fitBoundsToMarkers = () => {
      if (markers.value.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds()
        markers.value.forEach(marker => bounds.extend(marker.getPosition()))
        map.value.setBounds(bounds)
      }
    }

    const closeLargeImage = () => {
      showLargeImage.value = false
      largeImageUrl.value = ''
      activeHydrant.value = null
    }

    const uploadImage = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const user = auth.currentUser
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      if (!activeHydrant.value) {
        alert('선택된 소화전이 없습니다.')
        return
      }

      try {
        const imageRef = storageRef(storage, `hydrant-images/${activeHydrant.value.id}/${file.name}`)
        await uploadBytes(imageRef, file)
        const downloadURL = await getDownloadURL(imageRef)

        const updatedHydrant = {
          ...activeHydrant.value,
          imageUrl: downloadURL,
          lastModifiedBy: user.email,
          lastModifiedAt: new Date().toISOString()
        }

        await updateDoc(doc(db, 'csv_data', activeHydrant.value.id), updatedHydrant)
        emit('hydrant-updated', updatedHydrant)
        
        // 정보창의 이미지를 업데이트합니다
        const hydrantImage = document.getElementById('hydrantImage')
        if (hydrantImage) {
          hydrantImage.src = downloadURL
        }

        alert('이미지가 성공적으로 업로드되었습니다.')
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('이미지 업로드에 실패했습니다.')
      }
    }

    onMounted(() => {
      initializeKakaoMap()
    })

    watch(() => props.hydrants, (newHydrants) => {
      clearMarkers()
      if (newHydrants && newHydrants.length > 0) {
        newHydrants.forEach(addMarker)
        fitBoundsToMarkers()
      }
    }, { deep: true })

    return {
      map,
      markers,
      infowindow,
      showLargeImage,
      largeImageUrl,
      fileInput,
      addMarker,
      clearMarkers,
      fitBoundsToMarkers,
      showInfoWindow,
      closeLargeImage,
      uploadImage
    }
  }
}
</script>

<style scoped>
.full-screen-map {
  width: 100%;
  height: 100vh;
}

.large-image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.large-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
</style>