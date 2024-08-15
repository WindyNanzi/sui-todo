<script setup>
import { formatAddress } from '@mysten/sui/utils';

const balance = ref(Number(0).toFixed(2))
const address = ref('')
const showAddress = ref('')
const iconColor = ref('')
const copyIconName = ref('clipboard')

const copy = () => {
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

onMounted(async() => {
  address.value = unref(useWalletAddress())
  showAddress.value = formatAddress(unref(address))

  balance.value = Number(0).toFixed(2)
  balance.value = await getFormattedBalance(unref(address))
  
  
})

</script>

<template>
  <aside class="user">
    <ElAvatar 
      class="avatar" 
      src="/logo.svg" 
      fit="contain"
      size="small"
    >

    </ElAvatar>
    <div class="user-info">
      <div class="addr">
        <ElText size="small" type="info">{{  showAddress  }}</ElText>
          <Icon class="copy-icon"  :name="`i-line-md-${copyIconName}`" :style="{ color: iconColor }"  @click="copy" />
      </div>
      <div class="balance"> 
        <ElText size="small" type="info">balance {{ balance }} SUI </ElText> 
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
  width: 160px;
  border-radius: 25px;


  .user-info {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    opacity: .4;
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
</style>