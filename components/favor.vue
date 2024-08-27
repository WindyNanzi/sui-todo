<script setup>
import { formatAddress } from '@mysten/sui/utils'

const balance = ref(Number(0).toFixed(4))
const address = ref('')
const showAddress = ref('')
const iconColor = ref('')
const copyIconName = ref('clipboard')
const loading = ref(false)
const balanceLoading = ref(false)

function copy() {
  const text = unref(address)
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('Copied!')
      iconColor.value = '#67C23A'
      copyIconName.value = 'clipboard-check'
    }).catch((err) => {
      ElMessage.error('Copy Error!')
    }).finally(() => {
      setTimeout(() => {
        iconColor.value = ''
        copyIconName.value = 'clipboard'
      }, 1000)
    })
}
async function updateBalance() {
  balanceLoading.value = true

  getFormattedBalance(unref(address)).then((res) => {
    balance.value = res
  }).catch((err) => {
    ElMessage.error(err)
  }).finally(() => {
    balanceLoading.value = false
  })
}

function initAddrAndBalance(addr) {
  address.value = addr
  showAddress.value = formatAddress(addr)
  balance.value = Number(0).toFixed(4)
  updateBalance()
}

onMounted(async () => {
  const addr = useWalletAddress()
  if (addr) {
    initAddrAndBalance(addr)
  }
  else {
    loading.value = true
    ENOKI_FLOW.$zkLoginState.listen((val, oldVal) => {
      initAddrAndBalance(val.address)
      loading.value = false
    })
  }

  emitter.on('update-balance', () => {
    setTimeout(() => updateBalance(), 500)
  })
})
</script>

<template>
  <aside v-loading="loading" class="user">
    <ElAvatar
      class="avatar"
      src="/logo.svg"
      fit="contain"
      size="small"
    />
    <div class="user-info">
      <div class="addr">
        <ElText size="small" type="info">
          {{ showAddress }}
        </ElText>
        <Icon class="copy-icon" :name="`i-line-md-${copyIconName}`" :style="{ color: iconColor }" @click="copy" />
      </div>
      <div class="balance" @click="updateBalance">
        <ElText size="small" type="info">
          balance {{ balance }} SUI
        </ElText>
        <Icon v-show="balanceLoading" name="i-line-md-loading-alt-loop" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.user {
  display: flex;
  // justify-content: center;
  align-items: center;
  height: 50px;
  padding: 5px;
  margin-right: 12px;
  border-radius: 25px;

  .user-info {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    opacity: .8;
  }
}

.avatar {
  background-color: transparent;
}

.copy-icon {
  margin-left: 8px;
  &:hover {
    cursor: pointer;
  }
}

.balance {
  cursor: pointer;
}
</style>
