<script setup>
import { formatAddress } from '@mysten/sui/utils';

const balance = ref(Number(0).toFixed(2))
const address = ref('')
const showAddress = ref('')

onMounted(async() => {
  address.value = unref(useWalletAddress())
  showAddress.value = formatAddress(unref(address))

  balance.value = Number(0).toFixed(2)
  balance.value = await getFormattedBalance(unref(address))
  
})

</script>

<template>
  <aside class="user">
    <ElAvatar class="avatar" src="/logo.svg" fit="contain">

    </ElAvatar>
    <div class="user-info">
      <div class="addr">{{  showAddress  }}</div>
      <div class="balance"> balance: {{ balance }} SUI </div>
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
  width: 180px;
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

</style>