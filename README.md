# sui todo

一个搭建在sui链上的 todo list 应用

<!-- PROJECT SHIELDS -->
![License](https://img.shields.io/badge/license-MIT-yellow)
![Language](https://img.shields.io/badge/language-TS-blue)
![Language](https://img.shields.io/badge/language-SUI-lightblue)
<!-- PROJECT LOGO -->
<br />

<p align="center">
  <a href="https://github.com/WindyNanzi/sui-todo/">
    <img src="public/favicon.png" alt="Logo" width="80" height="80">
  </a>
</p>

## Introduce
- sui todo 是基于 `Nuxt3`，配合 `@mysten/sui`, 以及 `@mysten/zklogin` 的一款简单的 todo list 应用。目前仅支持在 `devnet` 环境下预览使用。

- 使用 Google 账户进行登录后，点击右上角的 ⚙ ，点击 `Get fees` 即可获得用于后续操作的 coin。
---
- Sui Todo is a simple to-do list application based on Nuxt3, combined with `@mysten/sui` and `@mysten/zklogin`. Currently, it only supports preview use in the `devnet` environment.

- After logging in with a Google account, click on the button in the upper right corner ⚙ ， Click 'Get fees' to obtain coins for subsequent operations.

> Tips：
>
> 输入框回车即可添加 todo 事项，一般来说列表会自动刷新，但是也有可能出现数据延时同步的情况，可以手动点击刷新按钮
>
> Enter the input box to add Todo items. Generally, the list will automatically refresh, but there may also be data synchronization delays. You can manually click the refresh button

## For developer
### Install
```sh
git clone https://github.com/WindyNanzi/sui-todo.git

pnpm install
```

### Publish Todo
```sh
cd todo

sui client publish
```

### config
You can set configs in `composibles/config.ts`，such as:
- PACKAGE_ID
- GOOGLE_CLIENT_ID
- APP_REDIRECT_URL

## Reference
[Building a Dapp with React, Move, and zkLogin on Sui Blockchain](https://dacade.org/communities/sui/challenges/19885730-fb83-477a-b95b-4ab265b61438/learning-modules/c9e21ff5-e7b3-4583-b21c-00c7176c10cc)


## 版权说明

该项目签署了MIT 授权许可，详情请参阅 [LICENSE.txt](/LICENSE.txt)

## Todo
-[] 将 zklogin 转移为 Enoki
-[] 添加 testnet 切换功能
 
## Thanks !
