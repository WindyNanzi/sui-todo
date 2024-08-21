<script setup>
import { bcs } from '@mysten/sui/bcs';
import { dayjs } from 'element-plus';

const todoList = ref([])
const listLoading = ref(false)

const updateTodoList = () => {
  listLoading.value = true
  getTodoItems().then((list) => {
    const listMap = list.sort((a, b) => { // sort by width and undo
      const aOffset = a.undo ? 0 : 5
      const bOffset = b.undo ? 0 : 5
      return  (b.width - bOffset) - (a.width - aOffset)
    }).map((todo) => {
      const { date: dateTime, id: addr, item: arr } = todo
      const date =  dayjs(Number(dateTime)).format('YYYY-MM-DD')
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
    }).reduce((pre, cur) => {
      const { date } = cur
      if(pre[date]) {
        pre[date].push(cur)
      } else {
        pre[date] = [cur]
      }
      return pre
    }, {})

    const todoItems = Object.keys(listMap).map(key => ({
      key,
      list: listMap[key],
      time: dayjs(key).valueOf()
    })).sort((a, b) => {  // sort by date
      return b.time - a.time 
    })

    todoList.value  = todoItems
  }).catch(err => {
    ElMessage.error(err?.message)
    console.error(err)
  }).finally(() => {
    listLoading.value = false
  })
}

onMounted(() => {
  updateTodoList()
  emitter.on('update-todo-list', () => updateTodoList())
  emitter.on('update-list-loading', (val) => listLoading.value = val)
})
</script>

<template>
  <main class="main">
    <div class="todo-list" v-loading="listLoading">
      <ElTimeline>
        <ElTimelineItem v-for="item in todoList" :key="item.key" :timestamp="item.key" placement="top"> 
          <TodoItem v-for="todoItem in item.list" v-bind="todoItem" :key="item.id" />
        </ElTimelineItem>
      </ElTimeline>
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
  width: 80%;
  max-height: 600px;
  overflow-y: auto;
}

.input-container {
  position: absolute;
  bottom: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
