

//abi: abi,address: address,chainId: chainId,
import { Abi, Address, Chain, createPublicClient, getContract as getContractViem, http, WalletClient } from "viem";
import { mainnet } from "wagmi/chains";

//重写获取合约信息(链路不传 默认走主网)
export const getContract = <TAbi extends Abi | readonly unknown[], TWClient extends WalletClient>(
    {
        abi,
        tAddress,
        tChain = mainnet,
        signer,
    }: {
        abi: TAbi | readonly unknown[],
        tAddress: Address,
        tChain?: Chain,
        signer?: TWClient,
    }
) => {
    const publicClient = createPublicClient({
        chain: tChain,
        transport: http(),
    })

    const contract = getContractViem({
        address: tAddress,
        abi: abi as TAbi,
        client: { public: publicClient, wallet: signer }
    })

    return {
        ...contract,
        account: signer?.account,
        chain: signer?.chain,
    }
}