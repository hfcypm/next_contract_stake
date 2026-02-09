import { useAccount, useReadContract } from "wagmi";
import { useStakeContract } from "./useContract";
import { useCallback, useEffect, useState } from "react";
import { retryWithDelay } from "../utils/retry";
import { Pid } from "../utils";
import { Address, formatUnits } from "viem";
import { addMetaNodeToMetaMask } from "../utils/metamask";
import { StakeContractAddress } from "../utils/env";

type RewardsData = {
    pendingRewards: string,
    stakedAmount: string,
    lastUpdate: number
};

// [stTokenAddress, poolWeight, lastRewardBlock, accMetaNodePerST
// , stTokenAmount, minDepositAmount, unstakeLockedBlocks]
type PoolData = [string, bigint, bigint, bigint, bigint, bigint, bigint];

type UserData = [bigint, bigint, bigint];
const useRewards = () => {
    //合约数据
    const stakeContract = useStakeContract();
    const contractAddress = stakeContract?.address;
    console.log('<<<<<contractAddress>>>>', contractAddress);
    //钱包状态
    const { isConnected, address } = useAccount();
    // 奖励数据
    const [rewardsData, setRewardsData] = useState<RewardsData>({
        pendingRewards: "0",
        stakedAmount: "0",
        lastUpdate: 0,
    });
    // 加载状态
    const [loading, setLoading] = useState<boolean>(false);
    // 连接池存在的数据
    const [poolData, setPoolData] = useState<Record<string, string>>({
        poolWeight: "0",
        lastRewardBlock: "0",
        accMetaNodePerShare: "0",
    });
    const [metaNodeAddress, setMetaNodeAddress] = useState<string>('');

    //重置状态函数
    const resetData = useCallback(() => {
        setRewardsData({
            pendingRewards: "0",
            stakedAmount: "0",
            lastUpdate: 0,
        });
        setPoolData({
            poolWeight: "0",
            lastRewardBlock: "0",
            accMetaNodePerShare: "0",
        });
    }, []);
    //使用wagmi 调整fetchPoolData
    // const { data: pool, refetch: fetchPoolData } = useReadContract({
    //     address: contractAddress as Address,
    //     abi: stakeContract?.abi,
    //     functionName: 'pool',
    //     args: [BigInt(Pid)],
    //     query: {
    //         enabled: !!stakeContract && !!contractAddress && isConnected,
    //         retry: 3,
    //     }
    // });
    // useEffect(() => {
    //     if (!address || !stakeContract) return;
    //     fetchPoolData().then(() => {
    //         if (pool) {
    //             console.log('pool', pool);
    //         }
    //     });
    // }, [address, stakeContract]);
    const fetchPoolData = useCallback(async () => {
        if (!stakeContract || !address || !isConnected) return;

        try {
            const pool = await retryWithDelay(() =>
                stakeContract.read.pool([BigInt(Pid)]) as Promise<PoolData>
            );
            console.log('poolInfo:::', pool);
            setPoolData({
                poolWeight: formatUnits(pool[1] as bigint || BigInt(0), 18),
                lastRewardBlock: formatUnits(pool[2] as bigint || BigInt(0), 18),
                accMetaNodePerShare: formatUnits(pool[3] as bigint || BigInt(0), 18),
                stTokenAmount: formatUnits(pool[4] as bigint || BigInt(0), 18),
                minDepositAmount: formatUnits(pool[5] as bigint || BigInt(0), 18),
                unstakeLockedBlocks: formatUnits(pool[6] as bigint || BigInt(0), 18),
                stTokenAddress: pool[0] as string
            });
        } catch (error) {
            console.error('Failed to fetch pool data:', error);
        }

    }, [stakeContract, address, isConnected]);

    // 获取MetaNode代币地址
    const fetchMetaNodeAddress = useCallback(async () => {
        if (!stakeContract) return;
        try {
            const address = await retryWithDelay(() =>
                stakeContract.read.MetaNode() as Promise<string>
            );
            setMetaNodeAddress(address as string);
        } catch (error) {
            console.error('Failed to fetch MetaNode address:', error);
        }
    }, [stakeContract]);

    //获取奖励数据
    const fetchRewardsData = useCallback(async () => {
        if (!stakeContract || !address || !isConnected) return;
        try {
            setLoading(true);
            // 获取用户数据
            const userData = await retryWithDelay(() =>
                stakeContract.read.user([BigInt(Pid), address]) as Promise<UserData>
            );
            const stakedAmount = await retryWithDelay(() =>
                stakeContract.read.stakingBalance([BigInt(Pid), address]) as Promise<bigint>
            );
            console.log('User data:', userData);
            console.log('Staked amount:', stakedAmount);
            setRewardsData({
                pendingRewards: formatUnits(userData[2] || BigInt(0), 18),
                stakedAmount: formatUnits(stakedAmount as bigint || BigInt(0), 18),
                lastUpdate: Date.now()
            });
        } catch (error) {
            console.error('Failed to fetch rewards data:', error);
            // 设置默认值
            setRewardsData({
                pendingRewards: '0',
                stakedAmount: '0',
                lastUpdate: Date.now()
            });
        } finally {
            setLoading(false);
        }
    }, [stakeContract, address, isConnected]);


    // 定期刷新数据（每60秒）
    useEffect(() => {
        if (!isConnected || !address) return;

        const interval = setInterval(() => {
            fetchRewardsData();
        }, 60000);// 60秒刷新一次

        return () => clearInterval(interval);
    }, [isConnected, address]);

    //手动刷新数据
    const refresh = useCallback(() => {
        if (!isConnected || !address) return;
        fetchRewardsData();
    }, [fetchRewardsData]);

    // 添加MetaNode代币到MetaMask
    const addMetaNodeToWallet = useCallback(async () => {
        if (!metaNodeAddress) {
            console.error('MetaNode地址未获取到');
            return false;
        }
        try {
            return await addMetaNodeToMetaMask(metaNodeAddress);
        } catch (error) {
            console.error('添加MetaNode到钱包失败:', error);
            return false;
        }
    }, [metaNodeAddress]);

    //初始化加载
    useEffect(() => {
        if (isConnected && address) {
            console.log('✅ Starting initial data fetch...');
            fetchRewardsData();
            fetchPoolData();
            fetchMetaNodeAddress();
        } else {
            resetData();
        }
    }, [isConnected, address, fetchRewardsData, fetchPoolData, fetchMetaNodeAddress]);

    return {
        rewardsData,
        loading,
        poolData,
        metaNodeAddress,
        refresh,
        addMetaNodeToWallet,
        canClaim: parseFloat(rewardsData.pendingRewards) > 0,
        resetData
    }
}

export default useRewards;