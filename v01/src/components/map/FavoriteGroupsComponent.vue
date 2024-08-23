<template>
  <div class="favorite-groups-component">
    <h5>선택된 용수 목록</h5>
    <ul class="list-group mb-3">
      <li v-for="hydrant in selectedHydrants" :key="hydrant.id" class="list-group-item d-flex justify-content-between align-items-center">
        {{ hydrant.소화용수번호 }} - {{ hydrant.새주소 }}
        <button @click="$emit('remove-hydrant', hydrant)" class="btn btn-sm btn-danger">삭제</button>
      </li>
    </ul>

    <h5>즐겨찾기 그룹</h5>
    <div class="mb-3">
      <input v-model="newGroupName" type="text" class="form-control mb-2" placeholder="새 그룹 이름">
      <button @click="createGroup" class="btn btn-primary">새 그룹 생성</button>
    </div>

    <div v-for="(group, groupName) in groupedSelectedHydrants" :key="groupName" class="mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <h6>{{ groupName }}</h6>
        <div>
          <button @click="$emit('toggle-group', groupName)" class="btn btn-sm btn-outline-primary me-2">
            {{ expandedGroups[groupName] ? '그룹 감추기' : '그룹 펼쳐보기' }}
          </button>
          <button @click="$emit('show-favorites', groupName)" class="btn btn-sm btn-info">
            그룹 불러오기
          </button>
        </div>
      </div>
      <div v-if="expandedGroups[groupName]">
        <ul class="list-group mt-2">
          <li v-for="hydrant in group" :key="hydrant.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ hydrant.소화용수번호 }} - {{ hydrant.새주소 }}
            <button @click="$emit('remove-from-group', { groupName, hydrant })" class="btn btn-sm btn-danger">삭제</button>
          </li>
        </ul>
        <div class="mt-2">
          <select v-model="selectedHydrantToAdd" class="form-select">
            <option value="">용수 선택</option>
            <option v-for="hydrant in selectedHydrants" :key="hydrant.id" :value="hydrant">
              {{ hydrant.소화용수번호 }}
            </option>
          </select>
          <button @click="addToGroup(groupName)" class="btn btn-sm btn-primary mt-2">그룹에 추가</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    selectedHydrants: Array,
    groupedSelectedHydrants: Object,
    expandedGroups: Object,
  },
  emits: ['remove-hydrant', 'create-group', 'toggle-group', 'show-favorites', 'remove-from-group', 'add-to-group'],
  setup(props, { emit }) {
    const newGroupName = ref('')
    const selectedHydrantToAdd = ref(null)

    const createGroup = () => {
      if (newGroupName.value) {
        emit('create-group', newGroupName.value)
        newGroupName.value = ''
      }
    }

    const addToGroup = (groupName) => {
      if (selectedHydrantToAdd.value) {
        emit('add-to-group', { groupName, hydrant: selectedHydrantToAdd.value })
        selectedHydrantToAdd.value = null
      }
    }

    return {
      newGroupName,
      selectedHydrantToAdd,
      createGroup,
      addToGroup
    }
  }
}
</script>

<style scoped>
.favorite-groups-component {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
</style>