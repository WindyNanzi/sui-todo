<script setup>
import { bcs } from '@mysten/sui/bcs'
import { dayjs } from 'element-plus'

const todoList = ref([])
const listLoading = ref(false)
const showMore = ref(false)
const lock = ref(false) // 设置 todo-item operate 的 lock 状态，防止频繁点击报错
const isRefuse = ref(false)
const showSelect = ref(false)
const selectedMap = reactive({})
const allSelected = ref(false)
const selectItems = computed(() => Object.keys(selectedMap).filter(key => selectedMap[key]))

function generateSortList(list) {
  const listMap = list.reduce((pre, cur) => {
    const { date } = cur
    if (pre[date]) {
      pre[date].push(cur)
    }
    else {
      pre[date] = [cur]
    }
    return pre
  }, {})

  const items = Object.keys(listMap).map(key => ({
    key,
    list: listMap[key],
    time: dayjs(key).valueOf(),
  })).sort((a, b) => { // sort by date
    return b.time - a.time
  })

  return items
}

function updateTodoList() {
  listLoading.value = true
  return getTodoItems().then((list) => {
    const tempList = list.sort((a, b) => { // sort by width and undo
      const aOffset = a.undo ? 0 : 5
      const bOffset = b.undo ? 0 : 5
      return (b.width - bOffset) - (a.width - aOffset)
    }).map((todo) => {
      const { date: dateTime, id: addr, item: arr } = todo
      const date = dayjs(Number(dateTime)).format('YYYY-MM-DD')
      const id = addr.id
      const u8Arr = new Uint8Array(arr)
      const item = bcs.string().parse(u8Arr)
      // console.log(item)
      return {
        ...todo,
        item,
        id,
        date,
      }
    })

    todoList.value = tempList
  }).catch((err) => {
    ElMessage.error(err?.message)
    console.error(err)
  }).finally(() => {
    listLoading.value = false
  })
}

const needShowMore = computed(() => unref(todoList).length >= 10)

const showList = computed(() => {
  const show = unref(showMore)
  const list = unref(todoList)
  if (show) {
    return generateSortList(list)
  }
  else {
    const items = list.slice(0, 10)
    return generateSortList(items)
  }
})

function refuse() {
  isRefuse.value = true
  updateTodoList().finally(() => {
    isRefuse.value = false
  })
}

function setSelectedMap(val) {
  unref(todoList).forEach((item) => {
    selectedMap[item.id] = val
  })
}

function retraction() {
  setSelectedMap(false)
  allSelected.value = false
  showSelect.value = false
}


function selectAll() {
  allSelected.value = !allSelected.value
  setSelectedMap(unref(allSelected))
}


function removeSelectedItems() {
  removeTodoItemList(unref(selectItems)).then(() => {
    ElMessage.success('delete success!')
    updateTodoList()
  }).catch(err => {
    ElMessage.error(err?.message)
  })
  retraction()
}

onMounted(() => {
  if (!unref(useIsAuthenticated())) {
    return navigateTo('/login')
  }
  updateTodoList().then(() => setSelectedMap(false))
  emitter.on('update-todo-list', () => setTimeout(() => updateTodoList(), 500))
  emitter.on('update-list-loading', val => listLoading.value = val)
  emitter.on('update-todo-item-operate-lock-status', val => lock.value = val)
})

onUnmounted(() => {
  emitter.off('*')
})
</script>

<template>
  <main class="main">
    <div class="todo-list" :class="[{ 'is-lock': lock }]">
      <div class="operate-box">
        <ElTooltip content="refuse data" placement="top">
          <Icon class="operate-icon" :class="[{ loop: isRefuse }]" name="i-line-md-rotate-270" @click="refuse" />
        </ElTooltip>
        <template v-if="todoList.length > 1">
          <ElTooltip content="batch delete" placement="top">
            <Icon 
              v-show="!showSelect" 
              class="operate-icon"
              name="i-line-md-square" 
              @click="showSelect = true" 
            />
          </ElTooltip>
        </template>
        
        <ElTooltip content="select all" placement="top">
          <Icon
            v-show="showSelect"
            :class="['operate-icon', { 'all-selected': allSelected }]" 
            name="i-line-md-square-to-confirm-square-transition"
            @click="selectAll" 
          />
        </ElTooltip>
        
        <ElTooltip content="retraction" placement="top">
          <Icon v-show="showSelect" class="operate-icon" name="i-line-md-rotate-180" @click="retraction" />
        </ElTooltip>

        <ElPopconfirm title="Are you sure to delete selected items?" placement="top" @confirm="removeSelectedItems">
          <template #reference>
            <ElBadge :value="selectItems.length"  :offset="[-1, 5]" v-show="showSelect && selectItems.length > 0">
              <Icon class="operate-icon" name="i-line-md-remove" style="color: #FF0F50; position: relative; top: -3px;" />
            </ElBadge>
          </template>
        </ElPopconfirm>
      </div>
      <ElEmpty v-if="todoList.length === 0" v-loading="listLoading" class="empty" />
      <ElTimeline v-show="showList.length > 0" v-loading="listLoading">
        <ElTimelineItem v-for="item in showList" :key="item.key" :timestamp="item.key" placement="top">
          <div  class="todo-item-container" v-for="todoItem in item.list" :key="todoItem.id">
            <ElCheckbox 
              v-show="showSelect"
              v-model="selectedMap[todoItem.id]"
              style="margin-right: 12px;"
            />
            <TodoItem  v-bind="todoItem"/>
          </div>
          
        </ElTimelineItem>
      </ElTimeline>
      <ElDivider v-if="needShowMore" border-style="dashed">
        <div class="divide-center-box" @click="showMore = !showMore">
          <ElIcon v-show="showMore">
            <ElIconArrowUp />
          </ElIcon>
          <ElText> {{ !showMore ? 'show more' : 'collapse' }} </ElText>
          <ElIcon v-show="!showMore">
            <ElIconArrowDown />
          </ElIcon>
        </div>
      </ElDivider>
    </div>
    <div class="input-container">
      <TodoInput />
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.todo-list {
  position: relative;
  width: 80%;
  height: calc(100vh - 200px);
  padding-right: 10px;
  overflow-y: auto;
}

.todo-item-container {
  display: flex;
  align-items: center;
  border-bottom: 1px dashed adjust-hue($color: #333, $degrees: 0.1);
}

.dark {
  .operate-box {
    background: #121212;
  }
}
.operate-box {
  position: sticky;
  top: 0;
  margin: 0 0 12px 30px;
  z-index: 2;
  background: #ffffff;
  font-size: 30px;
  height: 40px;
  transition: 500ms;
}

.all-selected {
  color: #409EFF;
}

.operate-icon {
  cursor: pointer;
}

.loop {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.input-container {
  position: absolute;
  bottom: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.divide-center-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.is-lock {
  :deep(.todo-item) {
    .remove-icon, .undo-icon {
      pointer-events: none;
    }
  }
}
.empty {
  margin-top: 100px;
}
</style>
