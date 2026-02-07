import { __private__ } from "@rainbow-me/rainbowkit"
import { useMemo } from "react"
import { Abi, Address, Chain } from "viem"
import { useChainId, useWalletClient } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { StakeContractAddress } from "../utils/env"
import { stakeAbi } from "../assets/abis/stake"
import { getContract } from "../utils/contractHelper"


// 定义 useContract 函数的参数类型
type useContractProps = {
    tChain?: number
}

//定义根据ID获取对应Chain字典
const chainDict: Record<number, Chain> = {
    1: mainnet,
    11_155_111: sepolia
};

export function useContract<tAbi extends Abi>(
    addressOrAddressMap?: Address | { [tChain: number]: Address },
    abi?: tAbi,
    options?: useContractProps,
) {
    //当前链ID
    const currentChainId = useChainId()
    //传递过来的chainID(当左侧的操作数为 null 或 undefined 时，返回右侧的操作数；否则返回左侧操作数)
    const chainId = options?.tChain ?? currentChainId
    //获取钱包信息
    const { data: walletClient } = useWalletClient()

    return useMemo(() => {
        if (!addressOrAddressMap || !abi || !chainId) {
            return null;
        }
        let address: Address | undefined;
        if (typeof addressOrAddressMap === 'string') {
            //单一地址
            address = addressOrAddressMap;
        } else {
            //多地址
            address = addressOrAddressMap[chainId];
        }
        if (!address) {
            return null;
        }
        //根据id获取网络类型
        const currentChain = chainDict[chainId] ?? mainnet;

        //获取合约信息
        try {
            const contract = getContract({
                abi: abi,
                tAddress: address,
                tChain: currentChain,
                signer: walletClient ?? undefined
            });
            return contract;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, [addressOrAddressMap, abi, chainId, walletClient]);
}


//抵押合约入口 获取相关合约信息
export const useStakeContract = () => {
    return useContract(
        StakeContractAddress, stakeAbi
    );
}