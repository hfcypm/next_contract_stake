'use client'

import { stakeAbi } from "@/app/assets/abis/stake";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useStakeContract } from "@/app/hooks/useContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { log } from "console";
import { motion } from "framer-motion";
import { useEffectEvent, useState } from "react";
import { FiArrowDown, FiGift, FiTrendingUp, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import { Address, zeroAddress } from "viem";
import { sepolia } from "viem/chains";
import { parseUnits } from "viem/utils";
import { useAccount, useAccountEffect, useBalance, useWaitForTransactionReceipt, useWalletClient, useWatchContractEvent, useWriteContract } from "wagmi";

const Stake = () => {
    //当前合约信息
    const stakeContract = useStakeContract();
    //当前钱包地址及连接状态
    const { address } = useAccount();
    // 奖励 先不处理
    // const { rewardsData, poolData, canClaim, refresh } = useRewards();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [isConnected, setisConnected] = useState(false);
    const { data } = useWalletClient();
    // 监听钱包连接状态
    useAccountEffect({
        onConnect: (account) => {
            console.log('钱包连接成功', account);
            setisConnected(true);
        },
        onDisconnect: () => {
            setisConnected(false);
        },
    });
    //代币余额
    const { data: balance } = useBalance({
        address: address,
        query: {
            enabled: isConnected,
            refetchInterval: 20000,
            refetchIntervalInBackground: false
        }
    });

    //合约读取写入
    const { writeContract, data: hash } = useWriteContract();
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
        const tAddress = stakeContract.address;
        try {
            setClaimLoading(true);
            writeContract({
                address: stakeContract.address,
                abi: stakeContract.abi,
                functionName: 'depositETH',
                value: parseUnits(amount, 18),
                args: [],
                chainId: sepolia.id,//质押先配置在sepolia测试网
            })
        } catch (error) {
            setClaimLoading(false);
            console.log(error);
            toast.error('Stake failed!');
            setIsLoading(false);
            setAmount('');
        }
    }

    // 监听合约事件（仅在成功时触发） 不能作用于点击事件中
    //监听合约事件
    //监听合约的状态（useWatchContractEvent） 事件
    //sol中这个标记
    //emit Deposit(msg.sender, _pid, _amount);
    useWatchContractEvent({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as Address,
        abi: stakeAbi,
        eventName: 'Deposit',
        chainId: sepolia.id,
        onLogs: (logs) => {
            console.log('Deposit:', logs);
            //当前交易执行成功！！！
            toast.success('Stake successful!');
            setIsLoading(false);
            setAmount('');
        },
    })

    //用户输入的事件
    const dealInputAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('用户输入的金额', e.target.value);
        setAmount(e.target.value);
    }

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

            <div className="w-full my-8">
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
                                    {/* {parseFloat(poolData.stTokenAmount || '0').toFixed(4)} ETH */}
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
            </div>

        </div>
    );
}

export default Stake;