'use client'
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useStakeContract } from "@/app/hooks/useContract";
import useRewards from "@/app/hooks/useRewards";
import { chainTConfig } from "@/app/providers";
import { Pid } from "@/app/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FiArrowDown, FiGift, FiInfo, FiTrendingUp, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import { Address } from "viem/accounts";
import { parseUnits } from "viem/utils";
import {
    useAccount, useBalance, useWalletClient, useWriteContract
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { sepolia } from "wagmi/chains";

const Stake = () => {
    //当前合约信息
    const stakeContract = useStakeContract();
    //当前钱包地址及连接状态
    const { address, isConnected } = useAccount();
    console.log('当前钱包地址>>>>Stake>>address', address);
    console.log('当前钱包地址状态>>>>Stake>>>isConnected', isConnected);
    //奖励
    const { rewardsData, poolData, canClaim, resetData, refresh } = useRewards();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const { data } = useWalletClient();
    //合约读取写入
    const { writeContract, data: stakeHash } = useWriteContract();
    //交易结果的回调
    //代币余额
    const { data: balance } = useBalance({
        address: address,
        query: {
            enabled: isConnected,
            refetchInterval: 50000,
            refetchIntervalInBackground: false
        }
    });
    //抵押代币
    const handleStak = async () => {
        if (!stakeContract || !data) {
            //合约为空或者数据空 
            toast.error('数据为空 检查钱包连接....');
            return;
        }
        console.log('用户输入的金额', parseFloat(amount));
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (parseFloat(amount) > parseFloat(balance!.formatted)) {
            toast.error('Amount cannot be greater than current balance');
            return;
        }
        try {
            setIsLoading(true);
            writeContract({
                address: stakeContract.address,
                abi: stakeContract.abi,
                functionName: 'depositETH',
                value: parseUnits(amount, 18),
                args: [],
                chainId: sepolia.id,//先配置在sepolia测试网
            })
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            toast.error('质押失败>:>>>>Stake failed!');
            setIsLoading(false);
            setAmount('');
        }
    }
    //用户输入的事件
    const dealInputAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    }
    //领取奖励
    const handleClaim = async () => {
        if (!stakeContract || !data) return

        try {
            setClaimLoading(true);
            rewardWriteContract({
                address: stakeContract.address as Address,
                abi: stakeContract.abi,
                functionName: 'claim',
                args: [BigInt(Pid)],
                chainId: sepolia.id,
            }
            );
        } catch (error) {
            setClaimLoading(false);
            toast.error('Transaction failed. Please try again.');
            console.log(error, 'claim-error');
        } finally {
            setClaimLoading(false);
        }
    }

    //领取奖励
    const { writeContract: rewardWriteContract, data: claimHash } = useWriteContract();
    //1 质押代币
    //2 领取奖励
    //以上两个结果的交易都需要监听交易确认
    useEffect(() => {
        if (!stakeHash || !isConnected || !address) return;
        waitForTransactionReceipt(chainTConfig, {
            hash: stakeHash,
        }).then((result) => {
            if (result.status === 'success') {
                console.log('质押成功交易>>>>', result);
                toast.success('Stake successful!----！！！！！！');
                setIsLoading(false);
                setAmount('');
            } else {
                toast.error('Stake Transaction failed!');
            }
        }).catch((error) => {
            console.log(error, '质押失败交易>>>>');
            toast.error('Transaction failed. Please try again.');
        });
    }, [stakeContract, stakeHash, address]);
    useEffect(() => {
        if (!claimHash || !isConnected || !address) return;
        waitForTransactionReceipt(chainTConfig, {
            hash: claimHash,
        }).then((result) => {
            if (result.status === 'success') {
                console.log('领取奖励成功交易>>Claim>>', result);
                toast.success('Claim successful!----！！！！！！');
                setClaimLoading(false);
            } else {
                toast.error('Transaction failed!');
            }
        });
    }, [stakeContract, claimHash, isConnected]);

    return (
        <div className="flex flex-col w-ful h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-8"
            >
                <div className="inline-block mb-2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full border-2 border-primary-500/20 flex items-center justify-center shadow-xl"
                        style={{ boxShadow: '0 0 60px 0 rgba(14,165,233,0.15)' }}
                    >
                        <FiZap className="w-12 h-12 text-primary-500" />
                    </motion.div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-2">
                    MetaNode Stake
                </h1>
                <p className="text-gray-400 text-xl">
                    Stake ETH to earn tokens
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 mt-3 gap-6 mx-auto max-w-6xl">
                {/* Stake Card */}
                <Card className="min-h-[420px] p-4 sm:p-8 md:p-12 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-2xl border-primary-500/20 border-[1.5px] rounded-2xl sm:rounded-3xl">
                    <div className="space-y-2">
                        {/* Staked Amount Display */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-8 bg-gray-800/70 rounded-xl sm:rounded-2xl border border-gray-700/50 group-hover:border-primary-500/50 transition-colors duration-300 shadow-lg">
                            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-primary-500/10 rounded-full">
                                <FiTrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
                            </div>
                            <div className="flex flex-col justify-center flex-1 min-w-0 items-center sm:items-start">
                                <span className="text-gray-400 text-base sm:text-lg mb-1">Staked Amount</span>
                                <span className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent leading-tight break-all">
                                    {parseFloat(poolData.stTokenAmount || '0').toFixed(4)} ETH
                                </span>
                            </div>
                        </div>

                        {/* Input Field */}
                        <Input
                            label="Amount to Stake"
                            type="number"
                            value={amount}
                            onChange={dealInputAmount}
                            placeholder="0.0"
                            rightElement={<span className="text-gray-500">ETH</span>}
                            helperText={balance ? `Available: ${parseFloat(balance.formatted).toFixed(4)} ETH` : undefined}
                            className="text-lg sm:text-xl py-3 sm:py-5 pr-2 h-10"
                        />

                        {/* Stake Button */}
                        <div className="pt-4 sm:pt-8">
                            <Button
                                onClick={handleStak}
                                disabled={isLoading || !amount}
                                loading={isLoading}
                                fullWidth
                                className="py-3 sm:py-5 text-lg sm:text-xl"
                            >
                                <FiArrowDown className="w-6 h-6 sm:w-7 sm:h-7" />
                                <span>Stake ETH</span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Claim Card */}
                <Card className="min-h-[420px] p-4 sm:p-8 md:p-12 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-2xl border-primary-500/20 border-[1.5px] rounded-2xl sm:rounded-3xl">
                    <div className="space-y-8 sm:space-y-12">
                        {/* Pending Reward Display */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-8 bg-gray-800/70 rounded-xl sm:rounded-2xl border border-gray-700/50 group-hover:border-primary-500/50 transition-colors duration-300 shadow-lg">
                            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-green-500/10 rounded-full">
                                <FiGift className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                            </div>
                            <div className="flex flex-col justify-center flex-1 min-w-0 items-center sm:items-start">
                                <span className="text-gray-400 text-base sm:text-lg mb-1">Pending Rewards</span>
                                <span className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent leading-tight break-all">
                                    {parseFloat(rewardsData.pendingRewards).toFixed(4)} MetaNode
                                </span>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
                                <div className="flex items-start space-x-3">
                                    <FiInfo className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-300">
                                        <p className="font-medium mb-1">How rewards work:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Rewards accumulate based on your staked amount and time</li>
                                            <li>• You can claim rewards anytime</li>
                                            <li>• Rewards are paid in MetaNode tokens</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Claim Button */}
                        <div className="pt-4 sm:pt-8">
                            {!isConnected ? (
                                <div className="flex justify-center">
                                    <div className="glow">
                                        <ConnectButton />
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleClaim}
                                    disabled={claimLoading || !canClaim}
                                    loading={claimLoading}
                                    fullWidth
                                    className="py-3 sm:py-5 text-lg sm:text-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                    <FiGift className="w-6 h-6 sm:w-7 sm:h-7" />
                                    <span>Claim Rewards</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}

export default Stake;