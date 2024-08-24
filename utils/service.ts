import { generateNonce, generateRandomness } from "@mysten/zklogin"
import { Transaction } from '@mysten/sui/transactions'
import { apiCore } from "./api"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { bcs } from "@mysten/sui/bcs"


/** 
 * 获取 Balance
 */
export async function getFormattedBalance(owner: string) {
  const res = await unref(SUI_CLIENT).getBalance({ owner })
  return Number(Number(res.totalBalance) / 1000_000_000).toFixed(4);
}


export async function login() {
  const client = unref(SUI_CLIENT)

  const instance = ElLoading.service({
    fullscreen: true,
    text: 'Loading...',
  })

  return client.getLatestSuiSystemState()
    .then(({ epoch }) => {
      const maxEpoch = Number(epoch) + 20; // max seems +30
      const ephemeralKeyPair = new Ed25519Keypair();
      const randomness = generateRandomness();
      const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);
      const jwtData = {
        maxEpoch,
        nonce,
        randomness,
        ephemeralKeyPair,
      };

      sessionStorage.setItem("jwt-data", JSON.stringify(jwtData));
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: APP_REDIRECT_URL,
        response_type: 'id_token',
        scope: 'openid email',
        nonce: nonce,
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
      window.location.href = authUrl;
    }).catch(error => {
      ElMessage.error('Error initiating Google login:', error?.message);
    }).finally(() => {
      setTimeout(() => {
        instance.close()
      }, 500)
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
  const keypairs = getEd25519Keypair()
  const sender = unref(useWalletAddress())
  let tmpBytes = ''

  txb.setGasBudget(1_000_000_000)
  txb.setSender(sender)
  txData.forEach(tx => {
    txb.moveCall(tx)
  })

  return txb.sign({
    client,
    signer: keypairs,
  }).then((res) => {
    const { bytes, signature } = res;
    tmpBytes = bytes
    // return signature
    return generateZkLoginSignature(signature)
  }).then(res => {
    return client.executeTransactionBlock({
      transactionBlock: tmpBytes,
      signature: res,
      options: {
        showEffects: true,
      },
      
    })
  }).then(res => {
    const {status = 'success', error = '' }  = res.effects?.status!
    
    if(status === 'failure' ) {
      emitter.emit('update-balance')
      throw new Error(error)
    }

    return res
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
      txb.pure.vector('u8', bcs.string().serialize(item).toBytes()),
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
      txb.pure.vector('u8', bcs.string().serialize(item).toBytes()),
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