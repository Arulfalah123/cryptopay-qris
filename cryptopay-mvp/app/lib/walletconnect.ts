import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc } from '@reown/appkit/networks'

export const PROJECT_ID = '93e7aee94c4f4cc3ac7dec404277470f'

export const USDT_BSC_CONTRACT = '0x55d398326f99059fF775485246999027B3197955' as const
export const IDR_TO_USDT = 15500

// Wagmi adapter untuk BSC
export const wagmiAdapter = new WagmiAdapter({
  networks: [bsc],
  projectId: PROJECT_ID,
})

// Inisialisasi AppKit (WalletConnect)
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc],
  projectId: PROJECT_ID,
  metadata: {
    name: 'CryptoQRIS',
    description: 'Terima USDT langsung ke wallet kamu',
    url: 'https://cryptopay-qris.vercel.app',
    icons: ['https://cryptopay-qris.vercel.app/favicon.ico'],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
})
