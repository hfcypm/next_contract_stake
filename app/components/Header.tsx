
'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiZap } from "react-icons/fi";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import Links from "./const/Path";
import { ConnectButton } from "@rainbow-me/rainbowkit";
const ContractHeader = () => {
    const pathName = usePathname();

    return (
        <div className="w-full h-20 bg-[#141A29] flex flex-row items-center">

            {/* left */}
            <div className="flex flex-row ml-24">
                <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 animate-pulse-slow mb-1 md:mb-0" />
                <span className="text-[#1597d8] text-2xl font-bold ml-2">Node Stake</span>
            </div>

            {/* center-nav */}
            <div className="flex flex-row items-center justify-center flex-1">
                <nav className="md:flex items-center space-x-6 lg:space-x-8">
                    {
                        Links.map((item) => {
                            const isActive = pathName === item.path || pathName === item.path + "/";
                            return (
                                <Link key={item.name} href={item.path}
                                    className={
                                        cn(
                                            "relative text-base lg:text-lg font-medium transition-all duration-300 group",
                                            isActive ? "text-blue-500" : "text-gray-300 hover:text-primary-400"
                                        )
                                    }
                                >
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            // className="absolute -bottom-[1.5px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300 z-10" />
                                </Link>
                            )
                        })
                    }
                </nav>
            </div>
            {/* right-wallet */}
            <div className="mr-10">
                <ConnectButton />
            </div>
        </div>
    );
};

export default ContractHeader;