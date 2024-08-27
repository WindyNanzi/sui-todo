<script setup>
const currentENV = SUI_CURRENT_ENV
async function changeENV(val) {
  if (currentENV.value !== val) {
    currentENV.value = val
    sessionStorage.setItem('sui-env', val)
    nextTick(() => {
      login()
    })

  }
}
const dropList = [
  // { id: 'main', text: 'Mainnet', handle: () => changeENV('main') },
  { id: 'test', text: 'Testnet', handle: () => changeENV('test') },
  { id: 'dev', text: 'Devnet', handle: () => changeENV('dev') },
]

const isFaucetENV = computed(() => {
  return ['test', 'dev'].includes(unref(currentENV))
})

const gasLoading = ref(false)

async function getGas() {
  const address = unref(useWalletAddress())
  gasLoading.value = true
  const { status, error } = await getFeesByAddress(address)
  gasLoading.value = false
  if (unref(status) === 'error') {
    return ElMessage.error(unref(error)?.message)
  }
  emitter.emit('update-balance')
}

async function logout() {
  sessionStorage.clear()
  emitter.emit('refuse-header-status')
  navigateTo('/login')
}
</script>

<template>
  <el-popover
    :width="200"
    popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 0;"
  >
    <template #reference>
      <ElButton circle class="setting-icon">
        <Icon name="i-line-md-cog-filled-loop" />
      </ElButton>
    </template>

    <template #default>
      <div class="popper-body">
        <div v-for="item in dropList" :key="item.id" class="popper-item" @click="item.handle">
          <div class="badge-box">
            <ElBadge v-show="item.id === currentENV" is-dot :offset="[20, 10]" />
          </div>
          <div class="text-box">
            {{ item.text }}
          </div>
        </div>

        <ElDivider v-show="isFaucetENV" border-style="dashed"class="divider" />
        <div v-show="isFaucetENV" v-loading="gasLoading" class="popper-item" @click="getGas">
          <div class="badge-box" />
          <div class="text-box">
            <span> Get fees </span>
            <Icon class="text-box-icon" name="i-line-md-coffee-half-empty-twotone-loop" />
          </div>
        </div>

        <ElDivider border-style="dashed" class="divider" />
        <div class="popper-item" @click="logout">
          <div class="badge-box" />
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
  padding: 20px;
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

.divider {
  margin: 0;
}
</style>
