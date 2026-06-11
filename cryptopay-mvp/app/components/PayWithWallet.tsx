'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract, useSwitchChain } from 'wagmi'
import { parseUnits } from 'viem'
import { bsc } from '@reown/appkit/networks'
import { USDT_BSC_CONTRACT } from '../lib/walletconnect'
import { useState } from 'react'

// ABI minimal untuk transfer ERC-20/BEP-20
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

interface Props {
  recipientAddress: string
  usdtAmount: number
  usdtDisplay: number
  idrAmount: string
  onSuccess: () => void
  onBack: () => void
}

export default function PayWithWallet({ recipientAddress, usdtAmount, usdtDisplay, idrAmount, onSuccess, onBack }: Props) {
  const { open } = useAppKit()
  const { address, isConnected, chainId } = useAppKitAccount()
  const { writeContractAsync } = useWriteContract()
  const { switchChainAsync } = useSwitchChain()
  const [status, setStatus] = useState<'idle' | 'switching' | 'sending' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState('')
  const [errMsg, setErrMsg] = useState('')

  async function handlePay() {
    try {
      // Switch ke BSC jika belum
      if (chainId !== bsc.id) {
        setStatus('switching')
        await switchChainAsync({ chainId: bsc.id })
      }

      setStatus('sending')

      // USDT BEP-20 = 18 desimal di BSC (berbeda dari TRC-20 yang 6)
      const amountInWei = parseUnits(usdtAmount.toFixed(18), 18)

      const hash = await writeContractAsync({
        address: USDT_BSC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountInWei],
        chainId: bsc.id,
      })

      setTxHash(hash)
      setStatus('success')
      setTimeout(onSuccess, 3000)
    } catch (e: unknown) {
      setStatus('error')
      const err = e as { shortMessage?: string; message?: string }
      setErrMsg(err.shortMessage || err.message || 'Transaksi gagal')
    }
  }

  return (
    <div className="space-y-4">
      {/* Info pembayaran */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '2px solid rgba(88,101,242,0.4)' }}>
        <p className="text-xs text-white/50 text-center mb-1 uppercase tracking-widest">Total pembayaran</p>
        <p className="text-4xl font-black text-white text-center">
          {usdtDisplay}
          <span className="text-lg text-white/40 ml-2">USDT</span>
        </p>
        <p className="text-sm text-white/40 text-center mt-1">
          ≈ Rp {parseFloat(idrAmount).toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-center mt-2 font-bold" style={{ color: '#f0b90b' }}>
          BNB Smart Chain (BSC / BEP-20)
        </p>
      </div>

      {!isConnected ? (
        // Tombol connect wallet
        <button
          onClick={() => open()}
          className="w-full py-4 rounded-full font-black text-base transition-all"
          style={{ backgroundColor: '#5865f2', color: '#fff' }}
        >
          🔗 Connect Wallet untuk Bayar
        </button>
      ) : (
        // Wallet terhubung — tampilkan info & tombol bayar
        <div className="space-y-3">
          <div className="rounded-lg px-4 py-2.5 flex justify-between items-center"
            style={{ backgroundColor: 'rgba(0,212,102,0.1)', border: '1px solid rgba(0,212,102,0.3)' }}>
            <span className="text-xs text-white/60">Wallet terhubung:</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#00d166' }}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

          {status === 'idle' && (
            <button
              onClick={handlePay}
              className="w-full py-4 rounded-full font-black text-base transition-all"
              style={{ backgroundColor: '#ffffff', color: '#404eed' }}
            >
              ⚡ Bayar {usdtDisplay} USDT Sekarang
            </button>
          )}

          {status === 'switching' && (
            <div className="w-full py-4 rounded-full font-bold text-sm text-center"
              style={{ backgroundColor: 'rgba(240,185,11,0.2)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.3)' }}>
              ⏳ Mengganti ke BSC Network...
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
              <p className="text-2xl">✅</p>
              <p className="font-black text-white">Pembayaran Berhasil!</p>
              <p className="text-xs text-white/50">TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
                style={{ color: '#5865f2' }}
              >
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
              <button
                onClick={() => { setStatus('idle'); setErrMsg('') }}
                className="w-full py-3 rounded-full font-bold text-sm"
                style={{ backgroundColor: '#ffffff', color: '#404eed' }}
              >
                Coba Lagi
              </button>
            </div>
          )}

          <button
            onClick={() => open()}
            className="w-full py-2 rounded-full text-xs transition-all"
            style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Ganti Wallet
          </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full py-2.5 rounded-full text-sm font-bold transition-all"
        style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
      >
        ← Kembali
      </button>
    </div>
  )
}
