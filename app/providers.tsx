'use client'

// 导入 React 类型
import { ReactNode } from 'react';

// 1. 导入RainbowKit的样式文件（必须导入，否则UI样式异常）
import '@rainbow-me/rainbowkit/styles.css';

// 2. 导入Wagmi和RainbowKit的核心配置组件与方法
import {
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
} from 'wagmi/chains';

// 导入 RainbowKit、Wagmi 和 TanStack 查询。
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

// 配置您所需的链并生成所需的连接器。您还需要设置 wagmi 配置。
// 如果您使用的是服务器端渲染(SSR) 的 dApp，请确保将 ssr 设置为 true。
// 注意：所有依赖 WalletConnect 的 dApp 现在都需要从 WalletConnect Cloud 获取一个 projectId。
// 这完全免费，只需几分钟即可完成。
const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'e5aff304a2d9ad531a09ba63d749e636',
    chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
    ssr: false, // If your dApp uses server side rendering (SSR)
});

// 包装供应商
// 使用 RainbowKitProvider、WagmiProvider 和 QueryClientProvider 将您的应用程序进行包装。
const queryClient = new QueryClient();


export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}

//WagmiProvider说明
// WagmiProvider 是 Wagmi 库提供的一个组件，用于将 Wagmi 配置应用到您的应用程序中。
// 它需要一个 config 参数，该参数是您在 getDefaultConfig 中创建的配置对象。
// 您可以在应用程序的任何地方使用 WagmiProvider 组件，以确保您的应用程序与 Wagmi 库集成。
// 提供 Web3 状态管理、钱包连接、链交互等功能
// 通过 config 对象配置区块链网络 

// RainbowKitProvider说明
// RainbowKitProvider 是 RainbowKit 库提供的一个组件，用于将 RainbowKit 配置应用到您的应用程序中。
// 它需要一个 appInfo 参数，该参数是一个对象，包含应用程序的名称和描述。
// 您可以在应用程序的任何地方使用 RainbowKitProvider 组件，以确保您的应用程序与 RainbowKit 库集成。
// 提供钱包选择、钱包连接、链交互等功能
// 通过 appInfo 对象配置钱包选择、钱包连接、链交互等功能

// QueryClientProvider说明
// QueryClientProvider 是 TanStack Query 库提供的一个组件，用于将 TanStack Query 配置应用到您的应用程序中。
// 它需要一个 client 参数，该参数是一个 QueryClient 对象，用于管理 TanStack Query 的状态。
// 您可以在应用程序的任何地方使用 QueryClientProvider 组件，以确保您的应用程序与 TanStack Query 库集成。
// 提供数据缓存、数据请求等功能
// 通过 client 对象配置数据缓存、数据请求等功能