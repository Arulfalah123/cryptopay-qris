'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { PROJECT_ID, USDT_BSC_CONTRACT } from '../lib/walletconnect'

// ABI minimal transfer ERC-20
const TRANSFER_ABI = {
  name: 'transfer',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
}

// Encode function call manual (tanpa ethers/viem)
function encodeTransfer(to: string, amountWei: bigint): string {
  // Function selector: keccak256("transfer(address,uint256)") = 0xa9059cbb
  const selector = 'a9059cbb'
  // Pad address to 32 bytes
  const paddedTo = to.slice(2).padStart(64, '0')
  // Pad amount to 32 bytes
  const paddedAmount = amountWei.toString(16).padStart(64, '0')
  return '0x' + selector + paddedTo + paddedAmount
}

interface Props {
  recipientAddress: string
  usdtAmount: number
  usdtDisplay: number
  idrAmount: string
  onSuccess: () => void
  onBack: () => void
}

type Status = 'init' | 'connecting' | 'connected' | 'sending' | 'success' | 'error'

export default function PayWithWallet({ recipientAddress, usdtAmount, usdtDisplay, idrAmount, onSuccess, onBack }: Props) {
  const [status, setStatus]     = useState<Status>('init')
  const [wcUri, setWcUri]       = useState('')
  const [account, setAccount]   = useState('')
  const [txHash, setTxHash]     = useState('')
  const [errMsg, setErrMsg]     = useState('')
  const providerRef = useRef<unknown>(null)

  useEffect(() => {
    initWalletConnect()
    return () => {
      // Cleanup
      if (providerRef.current) {
        const p = providerRef.current as { disconnect?: () => void }
        p.disconnect?.()
      }
    }
  }, [])

  async function initWalletConnect() {
    try {
      setStatus('connecting')
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider')

      const provider = await EthereumProvider.init({
        projectId: PROJECT_ID,
        chains: [56], // BSC
        optionalChains: [1],
        showQrModal: false, // Kita tampilkan QR sendiri
        metadata: {
          name: 'CryptoQRIS',
          description: 'Pembayaran USDT ke wallet merchant',
          url: 'https://cryptopay-qris.vercel.app',
          icons: ['https://cryptopay-qris.vercel.app/favicon.ico'],
        },
      })

      // Ambil URI untuk QR
      provider.on('display_uri', (uri: string) => {
        setWcUri(uri)
      })

      provider.on('connect', () => {
        const accounts = provider.accounts
        if (accounts?.length > 0) {
          setAccount(accounts[0])
          setStatus('connected')
        }
      })

      provider.on('disconnect', () => {
        setStatus('init')
        setWcUri('')
        setAccount('')
      })

      providerRef.current = provider

      // Trigger connect — ini akan emit display_uri
      await provider.connect()
    } catch (e: unknown) {
      const err = e as { message?: string }
      setStatus('error')
      setErrMsg(err.message || 'Gagal inisialisasi WalletConnect')
    }
  }

  async function handlePay() {
    if (!providerRef.current) return
    const provider = providerRef.current as {
      request: (args: { method: string; params: unknown[] }) => Promise<unknown>
      chainId: number
    }

    try {
      setStatus('sending')

      // Switch ke BSC jika perlu
      if (provider.chainId !== 56) {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // 0x38 = 56 = BSC
        })
      }

      // USDT BEP-20 = 18 desimal
      const amountWei = BigInt(Math.round(usdtAmount * 1e6)) * BigInt(1e12) // 6 + 12 = 18 desimal
      const data = encodeTransfer(recipientAddress, amountWei)

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: USDT_BSC_CONTRACT,
          data,
          gas: '0x186A0', // 100000 gas
        }],
      })

      setTxHash(hash as string)
      setStatus('success')
      setTimeout(onSuccess, 4000)
    } catch (e: unknown) {
      const err = e as { message?: string; code?: number }
      setStatus('connected') // kembali ke connected state
      if (err.code !== 4001) { // 4001 = user rejected
        setErrMsg(err.message || 'Transaksi gagal')
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Amount box */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '2px solid rgba(88,101,242,0.4)' }}>
        <p className="text-xs text-white/50 text-center mb-1 uppercase tracking-widest">Total pembayaran</p>
        <p className="text-4xl font-black text-white text-center">
          {usdtDisplay}<span className="text-lg text-white/40 ml-2">USDT</span>
        </p>
        <p className="text-sm text-white/40 text-center mt-1">≈ Rp {parseFloat(idrAmount).toLocaleString('id-ID')}</p>
        <p className="text-xs text-center mt-2 font-bold" style={{ color: '#f0b90b' }}>BNB Smart Chain · BSC/BEP-20</p>
      </div>

      {/* QR WalletConnect */}
      {status === 'connecting' && !wcUri && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">⏳ Menyiapkan QR WalletConnect...</p>
        </div>
      )}

      {wcUri && status === 'connecting' && (
        <div className="space-y-3">
          <p className="text-xs text-center text-white/60 font-bold uppercase tracking-wide">
            📱 Scan QR ini dengan wallet kamu
          </p>
          <div className="flex justify-center">
            <div className="p-4 rounded-xl bg-white">
              <QRCode value={wcUri} size={240} />
            </div>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {['MetaMask', 'Trust Wallet', 'Coinbase', 'OKX'].map(w => (
              <span key={w} className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(88,101,242,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                {w}
              </span>
            ))}
          </div>
          <p className="text-xs text-center text-white/30">
            Atau buka deep link: <button
              onClick={() => window.open(`wc:${wcUri.replace('wc:', '')}`)}
              className="underline"
              style={{ color: '#5865f2' }}>
              Buka di Wallet
            </button>
          </p>
        </div>
      )}

      {/* Wallet terhubung */}
      {status === 'connected' && (
        <div className="space-y-3">
          <div className="rounded-lg px-4 py-2.5 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(0,212,102,0.1)', border: '1px solid rgba(0,212,102,0.3)' }}>
            <span className="text-xs text-white/60">✅ Wallet terhubung:</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#00d166' }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>

          {errMsg && (
            <div className="rounded-lg px-4 py-2.5 text-xs"
              style={{ backgroundColor: 'rgba(242,63,67,0.15)', color: '#f23f43', border: '1px solid rgba(242,63,67,0.25)' }}>
              ❌ {errMsg}
            </div>
          )}

          <button onClick={handlePay}
            className="w-full py-4 rounded-full font-black text-base transition-all"
            style={{ backgroundColor: '#ffffff', color: '#404eed' }}>
            ⚡ Bayar {usdtDisplay} USDT Sekarang
          </button>
        </div>
      )}

      {status === 'sending' && (
        <div className="w-full py-4 rounded-full font-bold text-sm text-center"
          style={{ backgroundColor: 'rgba(88,101,242,0.2)', color: '#a5b4fc', border: '1px solid rgba(88,101,242,0.3)' }}>
          ⏳ Konfirmasi di wallet kamu...
        </div>
      )}

      {status === 'success' && (
        <div className="rounded-xl p-4 text-center space-y-2"
          style={{ backgroundColor: 'rgba(0,212,102,0.1)', border: '1px solid rgba(0,212,102,0.3)' }}>
          <p className="text-3xl">✅</p>
          <p className="font-black text-white">Pembayaran Berhasil!</p>
          <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-xs underline block" style={{ color: '#5865f2' }}>
            Lihat di BSCScan →
          </a>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <div className="rounded-lg px-4 py-2.5 text-sm"
            style={{ backgroundColor: 'rgba(242,63,67,0.15)', color: '#f23f43', border: '1px solid rgba(242,63,67,0.25)' }}>
            ❌ {errMsg}
          </div>
          <button onClick={initWalletConnect}
            className="w-full py-3 rounded-full font-bold text-sm"
            style={{ backgroundColor: '#ffffff', color: '#404eed' }}>
            Coba Lagi
          </button>
        </div>
      )}

      <button onClick={onBack}
        className="w-full py-2.5 rounded-full text-sm font-bold"
        style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
        ← Kembali
      </button>
    </div>
  )
}
