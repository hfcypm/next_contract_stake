'use client'
import { motion } from "framer-motion";
import { stakeAbi } from "@/app/assets/abis/stake";
import { useStakeContract } from "@/app/hooks/useContract";
import { Pid } from "@/app/utils";
import { cn } from "@/app/utils/cn";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowUp, FiClock, FiInfo } from "react-icons/fi";
import { Address, formatUnits, parseUnits } from "viem";
import { useAccount, useAccountEffect, useReadContract } from "wagmi";
import { toast } from 'react-toastify';
import { Preahvihear } from "next/font/google";

export type UserStakeData = {
    staked: string;//质押数量
    withdrawPending: string;//提现中数量
    withdrawable: string;//可提现数量
}

const initialData: UserStakeData = {
    staked: "0",
    withdrawPending: "0",
    withdrawable: "0",
}

const Withdraw = () => {
    //当前合约信息
    const stakeContract = useStakeContract();
    //当前钱包地址及连接状态
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState<string>("");
    const [unstakeLoading, setUnstakeLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserStakeData>(initialData);
    const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
    //合约读取stakingBalance获取
    const { refetch: refetchStakedAmount } = useReadContract({
        abi: stakeAbi,
        address: stakeContract?.address,
        functionName: "stakingBalance",
        args: [BigInt(Pid), address as Address],
    });
    //质押数量处理
    const dealStakedAmount = useCallback(() => {
        if (!stakeContract || !address) {
            return;
        }
        refetchStakedAmount().then((res) => {
            console.log('stakingBalance:::', res.data);
            initialData.staked = res.data ? formatUnits(res.data, 18) : "0"
        });
    }, [address, stakeContract]);
    const { refetch: refetchWidthDrawAmount } = useReadContract({
        abi: stakeAbi,
        address: stakeContract?.address,
        functionName: 'withdrawAmount',
        args: [BigInt(Pid), address as Address],
    });
    const dealUserData = useCallback(() => {
        console.log('<<<<<data>>>>>>>', '开始请求可提现数量');
        if (!address || !stakeContract) return;
        refetchWidthDrawAmount().then(result => {
            const [requestAmount, pendingWithdrawAmount] = result.data || [0, 0];
            console.log('requestAmount:::', requestAmount);
            console.log('pendingWithdrawAmount:::', pendingWithdrawAmount);
            //总的数量
            const total = formatUnits(BigInt(requestAmount), 18);
            //可以提现的
            const withdrawableAmount = formatUnits(BigInt(pendingWithdrawAmount), 18);
            //提现中
            const pendingWithdraw = (Number(total) - Number(withdrawableAmount)).toFixed(4);
            console.log('total:::', total);
            console.log('pendingWithdraw:::', pendingWithdraw);
            console.log('withdrawableAmount:::', withdrawableAmount);
            //更新卡片数据
            setUserData(preData => ({
                ...preData,
                withdrawable: withdrawableAmount,
                withdrawPending: pendingWithdraw,
            }))
        });
    }, [address, stakeContract]);
    useEffect(() => {
        if (!address || !stakeContract) {
            return;
        }
        dealUserData();
        //处理质押amount
        dealStakedAmount();
    }, [address, stakeContract, dealUserData, dealStakedAmount]);

    const isWithdrawable = useMemo(() => {
        return Number(userData.withdrawable) > 0 && isConnected;
    }, [userData, isConnected]);
    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    }
    //handleUnStake
    const handleUnStake = useCallback(async () => {
    }, [stakeContract, amount]);

    //handleWithdraw
    const handleWithdraw = useCallback(async () => {
    }, [stakeContract]);

    return (
        <div className="w-full flex flex-col items-center justify-center mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold my-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Withdraw</h1>
                <p className="text-gray-400 text-lg"> Unstake and withdraw your ETH</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card"
            >
                {/* stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StateCard label="Staked Amount" value={`${parseFloat(userData.staked).toFixed(4)} ETH`} />
                    <StateCard label="Available to Withdraw" value={`${parseFloat(userData.withdrawable).toFixed(4)} ETH`} />
                    <StateCard label="Pending Withdraw" value={`${parseFloat(userData.withdrawPending).toFixed(4)} ETH`} />
                </div>

                {/* Unstake Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Unstake</h2>

                    <div className="space-y-2">
                        {/* title */}
                        <label>Amount to Unstake</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0.0"
                                className={cn(
                                    "input-field pr-12",
                                    "focus:ring-primary-500 focus:border-primary-500"
                                )}
                            ></input>
                            {/* location:  top-1/2 -translate-y-1/*/}
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200">ETH</span>
                        </div>
                    </div>

                    {/* UnStake Button */}
                    <div className="pt-4">
                        {!isConnected ?
                            (
                                <div className="flex justify-center">
                                    <ConnectButton />
                                </div>
                            ) :
                            (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUnStake}
                                    disabled={!amount || unstakeLoading}
                                    className={cn(
                                        "btn-primary w-full flex justify-center items-center space-x-2",
                                        unstakeLoading && "opcation-70 cursor-not-allowed"
                                    )}
                                >
                                    {
                                        unstakeLoading ? (<>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>processing...</span>
                                        </>) :
                                            (<>
                                                <FiArrowUp className="w-5 h-5"></FiArrowUp>
                                                <span>Unstake ETH</span>
                                            </>
                                            )
                                    }

                                </motion.button>
                            )
                        }
                    </div>

                    {/* Withdraw Section */}
                    <div className="mt-12 space-y-6">
                        <h2 className="text-xl font-semibold">Withdraw</h2>
                        {/* Ready to Withdraw card*/}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            <div>
                                <div className="text-sm font-medium text-gray-600">Ready to Withdraw</div>
                                <div className="text-2xl font-semibold text-primary-600">0.0000 ETH</div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <FiClock className="mr-1" />
                                <span>20 min cooldown</span>
                            </div>
                        </div>
                    </div>

                    {/* After unstaking, you need to wait 20 minutes to withdraw */}
                    <div className="flex items-center space-x-2 text-sm">
                        <FiInfo className="text-gray-500" />
                        <div>After unstaking, you need to wait 20 minutes to withdraw</div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={handleWithdraw}
                        disabled={!isWithdrawable || withdrawLoading}
                        className={cn(
                            "btn-primary w-full flex items-center justify-center space-x-2",
                            (!isWithdrawable || withdrawLoading) && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {
                            withdrawLoading ? (
                                <>
                                    {/* loading */}
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) :

                                (
                                    <>
                                        <FiArrowUp className="w-5 h-5" />
                                        <span>Withdraw ETH</span>
                                    </>
                                )
                        }

                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}


function StateCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-sm text-gray-500 font-medium mb-1">{label}</div>
            <div className="text-2xl font-semibold text-primary-600">{value}</div>
        </div>
    );
}
export default Withdraw;