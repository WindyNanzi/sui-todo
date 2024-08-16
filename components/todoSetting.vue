<script setup>
const currentENV = SUI_CURRENT_ENV
const changeENV = async (val) => {
  if(currentENV.value !== val) {
    currentENV.value = val

    nextTick(() => {
      emitter.emit('update-balance')
    })
  }
}
const dropList = [
  { id: 'main', text: 'Mainnet', handle:() => changeENV('main') },
  { id: 'test', text:  'Testnet', handle:() => changeENV('test') },
]


const isFaucetENV = computed(() => {
  return ['test'].includes(unref(currentENV))
})


const getGas = async () => {
  emitter.emit('update-balance', true)
}

</script>

<template>
  <el-popover :width="200"
    popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
  >
    <template #reference>
      <ElButton circle class="setting-icon">
        <Icon name="i-line-md-cog-filled-loop"/>
      </ElButton>
    </template>

    <template #default>
      <div class="popper-body">
        <div class="popper-item" v-for="item in dropList" :key="item.id" @click="item.handle">
          <div class="badge-box"><ElBadge is-dot :offset="[20, 10]" v-show="item.id === currentENV"/></div> 
          <div class="text-box">{{ item.text }}</div>
        </div>

        <ElDivider v-show="isFaucetENV"/>
        <div class="popper-item" v-show="isFaucetENV" @click="getGas">
          <div class="badge-box"></div>
          <div class="text-box">
            <span> Get fees </span>
            <Icon class="text-box-icon" name="i-line-md-coffee-loop" />
          </div>
        </div>

        <ElDivider />
        <div class="popper-item">
          <div class="badge-box"></div>
          <div class="text-box">
            <span> Logout </span>
            <Icon class="text-box-icon" name="i-line-md-logout" />
          </div>
        </div>
      </div>
      


    </template>
  </el-popover>
</template>

<style lang="scss" scoped>
.setting-icon {
  font-size: 20px;
  margin-left: 12px;
}


.popper-item {
  width: 100%;
  display: flex;
  height: 30px;
  cursor: pointer;
  align-items: center;

  &:hover {
    .text-box {
      color: #409EFF;
    }
  }

  .text-box {
    display: flex;
    align-items: center;
  }

  .badge-box {
    width: 40px;
  }

  .text-box-icon {
    margin-left: 10px;
    font-size: 20px;
  }
}
</style>