'use client'
import { cn } from "@/app/utils/cn";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, MotionConfig } from "framer-motion";
import React, { useCallback, useMemo, useState } from "react";
import { FiArrowUp, FiClock, FiInfo } from "react-icons/fi";
import { useAccountEffect } from "wagmi";


export type UserStakeData = {
    staked: string;
    withdrawPending: string;
    withdrawable: string;
}

const initialData: UserStakeData = {
    staked: "0",
    withdrawPending: "0",
    withdrawable: "0",
}

const Withdraw = () => {
    const [isConnected, setConnected] = useState<boolean>(false);
    const [amount, setAmount] = useState<string>("");
    const [unstakeLoading, setUnstakeLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserStakeData>(initialData);
    const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
    //wallet connect disconnect event
    useAccountEffect({
        onConnect: (account) => {
            setConnected(true);
        },
        onDisconnect: () => {
            setConnected(false);
        }
    });

    const isWithdrawable = useMemo(() => {
        return Number(userData.withdrawable) > 0 && isConnected;
    }, [userData, isConnected]);
    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    }
    //handleUnStake
    const handleUnStake = useCallback(async () => {
        //todo: add unstake logic
    }, []);
    //handleWithdraw
    const handleWithdraw = useCallback(async () => {
        //todo: handleWithdraw logic
    }, []);

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
                    <StateCard label="Staked Amount" value="0.0000" />
                    <StateCard label="Available to Withdraw" value="0.0000" />
                    <StateCard label="Pending Withdraw" value="0.0000" />
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
                                    <div className="w-h h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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