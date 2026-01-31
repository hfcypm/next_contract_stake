import { useAccount, useCall } from "wagmi";
import { useStakeContract } from "./useContract";
import { useCallback, useEffect, useState } from "react";
import { retryWithDelay } from "../utils/retry";
import { Pid } from "../utils";
import { formatUnits } from "viem";
import { addMetaNodeToMetaMask } from "../utils/metamask";

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
    //钱包状态
    const { address, isConnected } = useAccount();
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
            const metaNode = await retryWithDelay(() =>
                stakeContract.read.MetaNode() as Promise<string>
            );
            setMetaNodeAddress(metaNode);
        } catch (error) {
            console.error('Failed to fetch MetaNode address:', error);
        }

    }, [stakeContract]);

    //获取奖励数据
    const fetchRewardsData = useCallback(async () => {
        if (!stakeContract || !address || !isConnected) return;

        try {
            setLoading(false);

            // 获取用户数据
            const userData = await retryWithDelay(() =>
                stakeContract.read.user([BigInt(Pid), address]) as Promise<UserData>
            );
            const stakeAmount = await retryWithDelay(() =>
                stakeContract.read.stakingBalance([BigInt(Pid), address]) as Promise<bigint>
            );

            console.log('userData:::', userData);
            console.log('stakeAmount:::', stakeAmount);
            setRewardsData({
                pendingRewards: formatUnits(userData[2] as bigint || BigInt(0), 18),
                stakedAmount: formatUnits(stakeAmount as bigint || BigInt(0), 18),
                lastUpdate: Date.now(),
            })
        } catch (error) {
            console.error('Failed to fetch rewards data:', error);
            //设置默认数据
            setRewardsData({
                pendingRewards: "0",
                stakedAmount: "0",
                lastUpdate: Date.now(),
            })
        } finally {
            setLoading(false);
        }
    }, [stakeContract, address, isConnected]);

    //初始化加载
    useEffect(() => {
        if (isConnected && address) {
            fetchRewardsData();
            fetchPoolData();
            fetchMetaNodeAddress();
        }
    }, [isConnected, address, fetchRewardsData, fetchPoolData, fetchMetaNodeAddress]);

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
