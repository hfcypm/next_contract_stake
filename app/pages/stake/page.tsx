'use client'
import { useAccountEffect } from "wagmi";

const Stake = () => {
    useAccountEffect({
        onConnect: (account) => {
            console.log('钱包连接成功', account);
        },
        onDisconnect: () => {
            console.log('disconnected');
        },
    });
    return (
        <div>
            <p className="text-[#1597d8] text-2xl font-bold ml-30">Stake</p>
        </div>
    )
}

export default Stake;