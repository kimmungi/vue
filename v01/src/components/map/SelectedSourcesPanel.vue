<template>
    <div class="selected-sources-panel">
      <h5>선택된 용수 목록</h5>
      <ul class="list-group mb-3">
        <li v-for="hydrant in selectedHydrants" :key="hydrant.id" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <input type="checkbox" :id="hydrant.id" v-model="hydrant.isChecked" class="me-2">
            <label :for="hydrant.id">{{ hydrant.소화용수번호 }} - {{ hydrant.새주소 }}</label>
          </div>
          <button @click="$emit('remove-hydrant', hydrant)" class="btn btn-sm btn-danger">삭제</button>
        </li>
      </ul>
  
      <div class="mb-3">
        <input v-model="newGroupName" type="text" class="form-control mb-2" placeholder="새 그룹 이름">
        <button @click="$emit('create-group', newGroupName)" class="btn btn-primary">즐겨찾기 그룹 생성</button>
      </div>
  
      <FavoriteGroups 
        :groupedHydrants="groupedSelectedHydrants"
        :selectedHydrants="selectedHydrants"
        :expandedGroups="expandedGroups"
        :selectedHydrantToAdd="selectedHydrantToAdd"
        @toggle-group="$emit('toggle-group', $event)"
        @show-favorites="$emit('show-favorites', $event)"
        @remove-from-group="$emit('remove-from-group', $event)"
        @add-to-group="$emit('add-to-group', $event)"
      />
    </div>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue'
  import FavoriteGroups from './map/FavoriteGroups.vue'
  
  export default defineComponent({
    name: 'SelectedSourcesPanel',
    components: {
      FavoriteGroups
    },
    props: {
      selectedHydrants: Array,
      groupedSelectedHydrants: Object,
      expandedGroups: Object,
      selectedHydrantToAdd: Object
    },
    emits: ['remove-hydrant', 'create-group', 'toggle-group', 'show-favorites', 'remove-from-group', 'add-to-group'],
    setup() {
      const newGroupName = ref('')
  
      return {
        newGroupName
      }
    }
  })
  </script>
  
  <style scoped>
  .selected-sources-panel {
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 10px;
    margin: 0;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
  </style>