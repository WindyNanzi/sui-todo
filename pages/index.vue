<script setup>
import { dayjs } from 'element-plus';

const todoList = ref([])

const updateTodoList = () => {
  getTodoItems().then((list) => {
    const listMap = list.sort((a, b) => {
      return Number(b.date) > Number(a.bate)
    }).map((item) => {
      const { date: dateTime, id: addr } = item
      const date =  dayjs(Number(dateTime)).format('YYYY-MM-DD')
      const id = addr.id
      return {
        ...item,
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
      list: listMap[key]
    }))

    todoList.value  = todoItems
  }).catch(err => {
    ElMessage.error(err?.message)
  })
}

onMounted(() => {
  updateTodoList()
  emitter.on('update-todo-list', () => updateTodoList())
})
</script>

<template>
  <main class="main">
    <div class="todo-list">
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
