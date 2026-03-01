'use client'

import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { useStakeContract } from "@/app/hooks/useContract";
import useRewards from "@/app/hooks/useRewards";
import { chainTConfig } from "@/app/providers";
import { Pid } from "@/app/utils";
import { cn } from "@/app/utils/cn";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiClock, FiGift, FiTrendingUp, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { sepolia } from "wagmi/chains";

const Claim = () => {
    //合约数据
    const stakeContract = useStakeContract();
    const { isConnected, address } = useAccount();
    const { rewardsData, refresh, canClaim } = useRewards();
    const [claimLoading, setClaimLoading] = useState<boolean>(false);
    const { data } = useWalletClient();

    const { writeContract: writeContractClaim, data: claimHash } = useWriteContract();
    //获取奖励
    const handleClaim = async () => {
        if (!stakeContract) return
        setClaimLoading(true);
        try {
            writeContractClaim({
                address: stakeContract.address,
                abi: stakeContract.abi,
                functionName: 'claim',
                args: [BigInt(Pid)],
                chainId: sepolia.id,
            })
        } catch (error) {
            console.log(error);
            setClaimLoading(false);
        }
    }
    // 监听领取奖励交易结果加载回调
    useEffect(() => {
        if (!claimHash || !isConnected || !address) return;
        waitForTransactionReceipt(chainTConfig, {
            hash: claimHash,
        }).then((result) => {
            if (result.status === 'success') {
                console.log('领取奖励成功交易>>Claim>>', result);
                toast.success('Claim successful!');
                setClaimLoading(false);
                refresh();
            } else {
                console.log('领取奖励失败交易>>Claim>>', result);
                toast.error('Claim failed!');
                setClaimLoading(false);
            }
        });

    }, [claimHash, data, isConnected, refresh]);

    return (
        <div className="w-full mx-auto max-w-6xl justify-center items-center">
            {/* 顶部标题说明 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center">
                <div className="inline-block border-2 border-[#a2f4c0] rounded-full p-4 mt-6 mx-auto">
                    <FiGift className="w-10 h-10 text-[#22C55F] "></FiGift>
                </div>
                <h1 className="text-[#22C55F] text-2xl font-bold mt-4">Claim Rewards</h1>
                <h3 className="text-[#9DA3AF] text-lg font-bold mt-2">Claim your MetaNode rewards</h3>
            </motion.div>

            {/* -----------奖励说明两个卡片页面------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">

                {/* Reward Statistics 奖励统计数据*/}
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-2xl border-green-500/20 border-[1.5px] rounded-2xl">
                    <div className="space-y-6">
                        {/* 1 标题*/}
                        <h2 className="text-[#22C55F] text-lg font-bold">Reward Statistics</h2>
                        {/* 2 奖励*/}
                        <div className="flex items-center justify-between border-2 border-[#1F3A40] rounded-xl p-4">
                            <div className="flex items-center ">
                                <FiGift className="w-6 h-6 text-[#22C55F]"></FiGift>
                                <span className="text-white ml-2">Pending Rewards</span>
                            </div>
                            {/* 已领取奖励 */}
                            <div>
                                <span className="text-2xl text-[#22C55F]">{parseFloat(rewardsData.pendingRewards).toFixed(4)} MetaNode </span>
                            </div>
                        </div>
                        {/* 3 质押数量 */}
                        <div className='flex items-center border-2 border-[#1F3A40] rounded-xl p-4 justify-between'>
                            <div className="flex items-center">
                                <FiTrendingUp className="w-6 h-6 text-[#61A6FB]"></FiTrendingUp>
                                <span className="text-white ml-2">Staked Amount</span>
                            </div>
                            <div>
                                <span className="text-2xl text-[#61A6FB]">
                                    {parseFloat(rewardsData.stakedAmount).toFixed(4)} ETH
                                </span>
                            </div>
                        </div>
                        {/* 上次更新时间 */}
                        <div className="flex justify-between border-2 border-[#1F3A40] rounded-xl p-4">
                            <div className="flex items-center">
                                <FiClock className='w-6 h-6 text-[#C084FC]'></FiClock>
                                <span className="text-white ml-2">Last Update</span>
                            </div>
                            <div>
                                <span className="text-[#C084FC]">{rewardsData.lastUpdate > 0 ? new Date(rewardsData.lastUpdate).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Claim Rewards  领取奖励页面*/}
                <Card className="p-6 sm:p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-2xl border-green-500/20 border-[1.5px] rounded-2xl">
                    <div className="space-y-6">
                        {/* 1 标题*/}
                        <h2 className="text-[#22C55F] text-lg font-bold">Claim Rewards</h2>
                        {/* 2.说明 */}
                        <div className="flex flex-col">
                            <div className="flex items-center" >
                                <FiClock className="w-6 h-6 text-[#61A6FB]"></FiClock>
                                <span className="text-[#61A6FB] ml-2">How claiming works:</span>
                            </div>
                            <div className="ml-6">
                                <ul className="text-[#61A6FB]">
                                    <li>. You can claim rewards anytime</li>
                                    <li>. Claimed rewards are sent to your wallet</li>
                                    <li>. No minimum claim amount required</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3.Ready to Claim  状态 */}
                        <div className="flex justify-between items-center border-2 border-[#1F3A40] rounded-lg p-4">
                            <div className="flex items-center">
                                <FiZap className={cn('w-6 h-6', canClaim ? 'text-[#22C55F]' : 'text-[#9DA3AF]')} />
                                <span className={cn('font-bold text-[#22C55F]', canClaim ? 'text-[#22C55F]' : 'text-[#9DA3AF]')}>
                                    {canClaim ? "Ready to Claim" : "No Rewards Available"}
                                </span>
                            </div>
                            <div className={cn('w-3 h-3 rounded-full', canClaim ? 'bg-[#22C55F]' : 'bg-[#9DA3AF]')}></div>
                        </div>

                        {/* 4.连接钱包的button */}
                        <div>
                            {
                                !isConnected ? (<ConnectButton></ConnectButton>) :
                                    (<Button
                                        onClick={handleClaim}
                                        disabled={claimLoading || !canClaim}
                                        loading={claimLoading}
                                        fullWidth
                                        className="py-4 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                        <FiGift className="w-6 h-6" />
                                        <span>
                                            {claimLoading ? 'Processing...' : canClaim ? 'Claim Rewards' : 'No Rewards'}
                                        </span>
                                    </Button>)
                            }
                        </div>
                    </div>
                </Card>
            </div>

            {/* Reward History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}>
                <Card className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl my-4">
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-300 text-2xl">Reward History</h2>
                        <div className="text-center mt-2">
                            <FiClock className="w-8 h-8 text-[#6C7280] mx-auto my-2"></FiClock>
                            <p>Reward history will be displayed here</p>
                            <p>Track your past claims and rewards</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

        </div>
    )
}

export default Claim;