<script setup>
import { dayjs } from 'element-plus'

const item = ref('')
const width = ref(1)
const taskTexts = [
  'Eliminate',
  'Delegate',
  'Schedule',
  'Do Immediately',
]

const taskColors = {
  1: '#B0C4DE',
  2: '#67C23A',
  3: '#FFA500',
  4: '#FF0F50',
}

const todoDateOffset = ref(0)
const loading = ref(false)

function updatePage() {
  emitter.emit('update-balance')
  emitter.emit('update-todo-list')
}

async function add() {
  const _item = unref(item)
  if (_item.trim() === '') {
    return
  }

  // date
  const offset = unref(todoDateOffset)
  const now = dayjs().add(offset, 'day')
  const day = now.startOf('day')
  const date = day.valueOf()

  const _width = unref(width)

  loading.value = true
  addTodoItem({
    item: _item,
    date,
    width: _width,
    background: '',
  }).then(() => {
    item.value = ''
    updatePage()
  }).catch((err) => {
    ElMessage.error(err?.message)
  }).finally(() => {
    loading.value = false
  })
}
</script>

<template>
  <div v-loading="loading" class="todo-item-box">
    <div class="todo-props">
      <ElRate v-model="width" :max="4" show-text :texts="taskTexts" :colors="taskColors" />

      <ElRadioGroup v-model="todoDateOffset" size="small">
        <ElRadioButton label="today" :value="0" />
        <ElRadioButton label="tomorrow" :value="1" />
      </ElRadioGroup>
    </div>
    <ElInput
      v-model="item"
      class="todo-item-input"
      maxlength="150"
      show-word-limit
      clearable
      placeholder="add todo item"
      @keydown.enter="add"
    >
      <template #prefix>
        <Icon name="i-line-md-plus" style="font-size: 20px;" />
      </template>
    </ElInput>
  </div>
</template>

<style lang="scss" scoped>
.todo-item-box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 80%;
}
.todo-item-input {
  width: 100%;
  height: 40px;
  caret-color: adjust-hue($color: #AAA, $degrees: 0.4);
  cursor: text;
}

.todo-props {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
