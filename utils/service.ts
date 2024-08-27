import { Transaction } from '@mysten/sui/transactions'
import { apiCore } from "./api"


/** 
 * 获取 Balance
 */
export async function getFormattedBalance(owner: string) {
  const res = await unref(SUI_CLIENT).getBalance({ owner })
  return Number(Number(res.totalBalance) / 1000_000_000).toFixed(4);
}

export async function login() {
  const network = `${unref(SUI_CURRENT_ENV)}net` as 'devnet' | 'testnet' | 'mainnet' | undefined
  const instance = ElLoading.service({
    fullscreen: true,
    text: 'Loading...',
  })

  ENOKI_FLOW.createAuthorizationURL({
    provider: 'google',
    network,
    clientId: GOOGLE_CLIENT_ID,
    redirectUrl: APP_REDIRECT_URL,
    extraParams: {
      scope: ['openid', 'email', 'profile']
    }
  }).then((url) => {
    window.location.href = url
  }).catch(err => {
    console.error(err)
  }).finally(() => {
    instance.close()
  })
}


export async function getFeesByAddress(address: string) {
  const url = `https://faucet.${ unref(SUI_CURRENT_ENV) }net.sui.io:443/gas`
  return apiCore(url, {
    method: 'POST',
    mode:'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      FixedAmountRequest: {
        recipient: address
      }
    }), 
  })
}


export  function makeMoveCall(txData: any[], txb: Transaction) {
  const client = unref(SUI_CLIENT)
  const sender = useWalletAddress()
  const network = `${ unref(SUI_CURRENT_ENV) }net` as 'testnet' | 'mainnet' | undefined

  let keypair = undefined

  txb.setGasBudget(1_000_000_000)
  txb.setSender(sender)
  txData.forEach(tx => {
    txb.moveCall(tx)
  })

  // network 虽然只接受 testnet 和 mainnet， 但 devnet 传入不会有影响
  return ENOKI_FLOW.getKeypair({ network }).then(res => {
    keypair = res

    return client.signAndExecuteTransaction({
      signer: keypair,
      transaction: txb,
      options: {
        showEffects: true
      }
    }).then(res => {
      const {status = 'success', error = '' }  = res.effects?.status!
      
      if(status === 'failure' ) {
        emitter.emit('update-balance')
        throw new Error(error)
      }
  
      return res
    })
  })
}
  

interface TodoItem {
  id?: string,
  item: string,
  date: number,
  width: number,
  undo?: boolean,
  background: string,
}


export async function addTodoItem(params: TodoItem) {
  const txb = new Transaction()
  const packageId = unref(PACKAGE_ID)
  const { item='', date= new Date().getTime(), width=0, background ='' } = params
  
  const objs = {
    package: packageId,
    module: 'todo',
    function: 'add',
    arguments: [
      // txb.pure.vector('u8', bcs.string().serialize(item).toBytes()),
      txb.pure.string(item),
      txb.pure.u64(date),
      txb.pure.u8(width),
      txb.pure.string(background),
    ]
  }

  return makeMoveCall([objs], txb)
}


export async function getTodoItems(): Promise<void | Boolean | TodoItem[]> {
  const sender = unref(useWalletAddress())
  const client = unref(SUI_CLIENT)
  const packageId = unref(PACKAGE_ID)

  return client.getOwnedObjects({
    owner: sender
  }).then((ownerObjects) => {
    const { data = [] } = ownerObjects
    const ids = data.map((item) => item.data?.objectId!)
    const options =  { showType: true, showContent: true }
    return client.multiGetObjects({ ids, options })
  }).then(objects => {
    const todoItems = objects.filter(obj => {
      return obj.data?.type === `${packageId}::todo::ToDo`
    }).map((item: any) => {
      return item.data?.content?.fields
    })

    return todoItems as TodoItem[]
  })
}

export async function setTodoItem(params: TodoItem) {
  const txb = new Transaction()
  const packageId = unref(PACKAGE_ID)
  const { item='', date= new Date().getTime(), width=0, background ='', undo = true,  id = '' } = params

  const objs = {
    package: packageId,
    module: 'todo',
    function: 'update',
    arguments: [
      // txb.pure.vector('u8', bcs.string().serialize(item).toBytes()),
      txb.pure.string(item),
      txb.pure.u64(date),
      txb.pure.u8(width),
      txb.pure.string(background),
      txb.pure.bool(undo),
      txb.object(id),
    ]
  }

  return makeMoveCall([objs], txb)
}



export async function removeTodoItem(id: string) {
  const txb = new Transaction()
  const packageId = unref(PACKAGE_ID)
  
  const objs = {
    package: packageId,
    module: 'todo',
    function: 'remove',
    arguments: [
      txb.object(id),
    ]
  }

  return makeMoveCall([objs], txb)
}

export async function removeTodoItemList(ids: string[]) {
  const txb = new Transaction()
  const packageId = unref(PACKAGE_ID)
  

  const txs = ids.map(id => ({
    package: packageId,
    module: 'todo',
    function: 'remove',
    arguments: [
      txb.object(id)
    ]
  }))
  
  return makeMoveCall([...txs], txb)
}