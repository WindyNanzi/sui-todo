<script setup>
import { bcs } from '@mysten/sui/bcs'
import { dayjs } from 'element-plus'

const todoList = ref([])
const listLoading = ref(false)
const showMore = ref(false)
const lock = ref(false) // 设置 todo-item operate 的 lock 状态，防止频繁点击报错
const isRefuse = ref(false)

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

onMounted(() => {
  if (!unref(useIsAuthenticated())) {
    return navigateTo('/login')
  }
  updateTodoList()
  emitter.on('update-todo-list', () => setTimeout(updateTodoList(), 500))
  emitter.on('update-list-loading', val => listLoading.value = val)
  emitter.on('update-todo-item-operate-lock-status', val => lock.value = val)
})

onUnmounted(() => {
  emitter.off('*')
})
</script>

<template>
  <main class="main">
    <div v-loading="listLoading" class="todo-list" :class="[{ 'is-lock': lock }]">
      <div class="operate-box">
        <ElTooltip content="refuse data" placement="top">
          <Icon class="refuse" :class="[{ loop: isRefuse }]" name="i-line-md-rotate-270" @click="refuse" />
        </ElTooltip>
      </div>
      <ElEmpty v-if="showList.length === 0" class="empty" />
      <ElTimeline v-show="showList.length > 0">
        <ElTimelineItem v-for="item in showList" :key="item.key" :timestamp="item.key" placement="top">
          <TodoItem v-for="todoItem in item.list" v-bind="todoItem" :key="item.id" />
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

.dark {
  .operate-box {
    background: #121212;
  }
}
.operate-box {
  position: sticky;
  top: 0;
  margin: 0 0 12px 30px;
  z-index: 1;
  background: #ffffff;
}

.refuse {
  font-size: 30px;
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
