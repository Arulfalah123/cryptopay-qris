'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { IDR_TO_USDT } from './lib/walletconnect'

// Lazy load untuk hindari SSR error
const PayWithWallet = dynamic(() => import('./components/PayWithWallet'), { ssr: false })

const APP_VERSION = 'v0.6'
const USDT_TRC_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

type PayMode   = 'select' | 'crypto-bsc' | 'crypto-trc' | 'walletconnect'
type CryptoFlow = 'form' | 'qr' | 'pay'

export default function Home() {
  const [payMode, setPayMode]   = useState<PayMode>('select')
  const [flow, setFlow]         = useState<CryptoFlow>('form')
  const [wallet, setWallet]     = useState('')
  const [amount, setAmount]     = useState('')
  const [copied, setCopied]     = useState(false)
  const [copiedC, setCopiedC]   = useState(false)
  const [error, setError]       = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactMsg, setContactMsg]   = useState('')

  const usdtAmount  = amount ? parseFloat((parseFloat(amount) / IDR_TO_USDT).toFixed(6)) : 0
  const usdtDisplay = usdtAmount ? parseFloat(usdtAmount.toFixed(2)) : 0
  const qrValue     = wallet || ''
  const contractAddr = payMode === 'crypto-trc' ? USDT_TRC_CONTRACT : ''

  function goBack() {
    setFlow('form')
    setWallet('')
    setAmount('')
    setError('')
  }

  function backToSelect() {
    goBack()
    setPayMode('select')
  }

  function validateAndGenerate() {
    if (!wallet || !amount) return setError('Isi semua field!')
    const isValidEVM  = wallet.startsWith('0x') && wallet.length === 42
    const isValidTRON = wallet.startsWith('T') && wallet.length === 34
    if (payMode === 'crypto-bsc'  && !isValidEVM)  return setError('Wallet BSC harus mulai 0x, 42 karakter')
    if (payMode === 'crypto-trc'  && !isValidTRON) return setError('Wallet TRON harus mulai T, 34 karakter')
    if (parseFloat(amount) <= 0) return setError('Nominal harus lebih dari 0')
    setError('')
    setFlow('qr')
  }

  function copyAddress() { navigator.clipboard.writeText(wallet); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  function copyContract() { navigator.clipboard.writeText(contractAddr); setCopiedC(true); setTimeout(() => setCopiedC(false), 2000) }

  const networkLabel = payMode === 'crypto-bsc' ? 'BNB Smart Chain (BSC / BEP-20)' : 'TRON (TRC-20)'

  return (
    <div className="bg-discord min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="content flex items-center justify-between px-8 py-4">
        <button onClick={backToSelect} className="flex items-center gap-2">
          <span className="text-2xl">₿</span>
          <span className="font-bold text-xl text-white">CryptoQRIS</span>
          <span className="text-xs text-white/30 font-mono">{APP_VERSION}</span>
        </button>
        <div className="text-xs text-white/40 px-3 py-1.5 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          USDT · BSC & TRC-20
        </div>
      </nav>

      <div className="content flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* ── SELECT METODE ── */}
            {payMode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-4xl font-black uppercase text-center mb-2">BUAT QR BAYAR</h1>
                <p className="text-center text-white/50 text-sm mb-8">
                  Pilih metode pembayaran untuk pembelimu
                </p>

                <div className="space-y-3">
                  {/* WalletConnect — BARU */}
                  <button
                    onClick={() => setPayMode('walletconnect')}
                    className="w-full rounded-2xl p-5 text-left transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: 'rgba(88,101,242,0.2)', border: '2px solid #5865f2' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🔗</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-white text-base">WalletConnect</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: 'rgba(0,212,102,0.2)', color: '#00d166', border: '1px solid rgba(0,212,102,0.3)' }}>
                            ✨ BARU
                          </span>
                        </div>
                        <p className="text-xs text-white/50">Pembeli scan QR → langsung bayar otomatis</p>
                      </div>
                      <span className="text-white/40">→</span>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {['MetaMask', 'Trust Wallet', 'Coinbase', 'OKX', '300+ wallet'].map(w => (
                        <span key={w} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(88,101,242,0.25)', color: 'rgba(255,255,255,0.7)' }}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* BSC Manual QR */}
                  <button
                    onClick={() => { setPayMode('crypto-bsc'); setFlow('form') }}
                    className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔵</span>
                      <div>
                        <p className="font-bold text-white text-sm">QR Manual · BSC/BEP-20</p>
                        <p className="text-xs text-white/40">Wallet address 0x... · Trust Wallet, MetaMask</p>
                      </div>
                      <span className="ml-auto text-white/30 text-sm">→</span>
                    </div>
                  </button>

                  {/* TRC-20 Manual QR */}
                  <button
                    onClick={() => { setPayMode('crypto-trc'); setFlow('form') }}
                    className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔴</span>
                      <div>
                        <p className="font-bold text-white text-sm">QR Manual · TRC-20</p>
                        <p className="text-xs text-white/40">Wallet address T... · Binance, OKX, Bybit withdraw</p>
                      </div>
                      <span className="ml-auto text-white/30 text-sm">→</span>
                    </div>
                  </button>

                  {/* QRIS IDR Coming Soon */}
                  <div className="w-full rounded-2xl p-4 relative overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: 'rgba(255,170,0,0.15)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                      🔜 Segera
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏦</span>
                      <div>
                        <p className="font-bold text-white/40 text-sm">QRIS IDR</p>
                        <p className="text-xs text-white/25">GoPay · Dana · OVO · BCA · dll</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs mt-5 text-white/20">
                  100% gratis · Tidak perlu daftar · Langsung pakai
                </p>
              </motion.div>
            )}

            {/* ── WALLETCONNECT FLOW ── */}
            {payMode === 'walletconnect' && (
              <motion.div key="wc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={backToSelect} className="flex items-center gap-1 text-xs text-white/40 mb-5 hover:text-white/70 transition-colors">
                  ← Kembali
                </button>
                <h1 className="text-3xl font-black uppercase text-center mb-1">WALLETCONNECT</h1>
                <p className="text-center text-white/50 text-sm mb-6">Pembeli scan QR → bayar langsung otomatis</p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  {flow === 'form' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                          Wallet Address Kamu (BSC/BEP-20, mulai 0x)
                        </label>
                        <input
                          type="text"
                          value={wallet}
                          onChange={e => setWallet(e.target.value)}
                          placeholder="0x... (42 karakter)"
                          className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none"
                          style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                          onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                          onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                          Nominal Tagihan (IDR)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-sm text-white/40">Rp</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="150000"
                            className="w-full rounded-lg pl-12 pr-4 py-3 text-sm outline-none"
                            style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                            onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                          />
                        </div>
                        {usdtAmount > 0 && (
                          <div className="mt-2 rounded-lg px-4 py-2 flex justify-between"
                            style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.25)' }}>
                            <span className="text-xs text-white/50">Pembeli bayar:</span>
                            <span className="text-sm font-black" style={{ color: '#5865f2' }}>{usdtDisplay} USDT</span>
                          </div>
                        )}
                      </div>
                      {error && (
                        <div className="rounded-lg px-4 py-2.5 text-sm"
                          style={{ backgroundColor: 'rgba(242,63,67,0.15)', color: '#f23f43', border: '1px solid rgba(242,63,67,0.25)' }}>
                          {error}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (!wallet || !amount) return setError('Isi semua field!')
                          if (!wallet.startsWith('0x') || wallet.length !== 42) return setError('Wallet BSC harus mulai 0x, 42 karakter')
                          if (parseFloat(amount) <= 0) return setError('Nominal harus lebih dari 0')
                          setError('')
                          setFlow('pay')
                        }}
                        className="w-full py-3 rounded-full font-bold text-base transition-all"
                        style={{ backgroundColor: '#ffffff', color: '#404eed' }}
                      >
                        ⚡ Lanjut ke Pembayaran
                      </button>
                    </div>
                  )}

                  {flow === 'pay' && (
                    <PayWithWallet
                      recipientAddress={wallet}
                      usdtAmount={usdtAmount}
                      usdtDisplay={usdtDisplay}
                      idrAmount={amount}
                      onSuccess={backToSelect}
                      onBack={() => setFlow('form')}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ── MANUAL QR FORM (BSC / TRC-20) ── */}
            {(payMode === 'crypto-bsc' || payMode === 'crypto-trc') && flow === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={backToSelect} className="flex items-center gap-1 text-xs text-white/40 mb-5 hover:text-white/70 transition-colors">
                  ← Kembali
                </button>
                <h1 className="text-3xl font-black uppercase text-center mb-1">
                  {payMode === 'crypto-bsc' ? '🔵 QR BSC/BEP-20' : '🔴 QR TRC-20'}
                </h1>
                <p className="text-center text-white/50 text-sm mb-6">Isi detail pembayaran kamu</p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                      Wallet Address ({payMode === 'crypto-bsc' ? 'BSC · mulai 0x' : 'TRON · mulai T'})
                    </label>
                    <input
                      type="text"
                      value={wallet}
                      onChange={e => setWallet(e.target.value)}
                      placeholder={payMode === 'crypto-bsc' ? '0x... (42 karakter)' : 'T... (34 karakter)'}
                      className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                      onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                      Nominal Tagihan (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm text-white/40">Rp</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="150000"
                        className="w-full rounded-lg pl-12 pr-4 py-3 text-sm outline-none"
                        style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                        onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                        onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                      />
                    </div>
                    {usdtAmount > 0 && (
                      <div className="mt-2 rounded-lg px-4 py-2 flex justify-between"
                        style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.25)' }}>
                        <span className="text-xs text-white/50">Pembeli bayar:</span>
                        <span className="text-sm font-black" style={{ color: '#5865f2' }}>{usdtDisplay} USDT</span>
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="rounded-lg px-4 py-2.5 text-sm mb-4"
                      style={{ backgroundColor: 'rgba(242,63,67,0.15)', color: '#f23f43', border: '1px solid rgba(242,63,67,0.25)' }}>
                      {error}
                    </div>
                  )}
                  <button
                    onClick={validateAndGenerate}
                    className="w-full py-3 rounded-full font-bold text-base transition-all"
                    style={{ backgroundColor: '#ffffff', color: '#404eed' }}
                  >
                    ⚡ Buat QR Pembayaran
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── MANUAL QR PAGE ── */}
            {(payMode === 'crypto-bsc' || payMode === 'crypto-trc') && flow === 'qr' && (
              <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-black uppercase text-center mb-1">SCAN & BAYAR</h1>
                <p className="text-center text-white/50 text-sm mb-5">Tunjukkan QR ini ke pembeli</p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  <div className="flex justify-center mb-3">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: payMode === 'crypto-bsc' ? 'rgba(88,101,242,0.2)' : 'rgba(239,68,68,0.2)',
                        color: payMode === 'crypto-bsc' ? '#a5b4fc' : '#fca5a5',
                        border: `1px solid ${payMode === 'crypto-bsc' ? 'rgba(88,101,242,0.4)' : 'rgba(239,68,68,0.4)'}`
                      }}>
                      {payMode === 'crypto-bsc' ? '🔵 BSC / BEP-20' : '🔴 TRON / TRC-20'}
                    </span>
                  </div>

                  <div className="flex justify-center mb-2">
                    <div className="p-4 rounded-xl bg-white">
                      <QRCode value={qrValue} size={240} />
                    </div>
                  </div>
                  <p className="text-center text-xs text-white/30 mb-4">Scan dari dalam app crypto · Bukan dari kamera HP</p>

                  <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs text-white/40 text-center mb-1 uppercase tracking-widest">Kirim tepat sebesar</p>
                    <p className="text-4xl font-black text-white text-center">
                      {usdtDisplay}<span className="text-lg text-white/40 ml-2">USDT</span>
                    </p>
                    <p className="text-sm text-white/40 text-center mt-1">≈ Rp {parseFloat(amount).toLocaleString('id-ID')}</p>
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs font-bold text-center" style={{ color: payMode === 'crypto-bsc' ? '#a5b4fc' : '#fca5a5' }}>
                        ⚠️ Wajib kirim via {networkLabel}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Wallet address penerima:</p>
                  <button onClick={copyAddress}
                    className="w-full rounded-lg px-4 py-3 text-xs font-mono flex justify-between items-center mb-3"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="truncate">{wallet}</span>
                    <span className="ml-2 shrink-0 font-bold" style={{ color: copied ? '#00d166' : '#5865f2' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>

                  {payMode === 'crypto-trc' && (
                    <>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Contract USDT TRC-20:</p>
                      <button onClick={copyContract}
                        className="w-full rounded-lg px-3 py-2.5 text-xs font-mono flex justify-between items-center mb-3"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="truncate text-white/50">{contractAddr}</span>
                        <span className="ml-2 shrink-0 font-bold text-xs" style={{ color: copiedC ? '#00d166' : '#5865f2' }}>
                          {copiedC ? '✓' : 'Copy'}
                        </span>
                      </button>
                    </>
                  )}

                  <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)' }}>
                    <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wide">📱 Cara pembeli bayar:</p>
                    {payMode === 'crypto-bsc' ? (
                      <ol className="text-xs text-white/50 space-y-1 list-none">
                        <li>1. Buka <strong className="text-white/80">Trust Wallet</strong> atau <strong className="text-white/80">MetaMask</strong></li>
                        <li>2. Tap <strong className="text-white/80">Send</strong> → pilih <strong className="text-white/80">USDT BEP-20</strong></li>
                        <li>3. Tap ikon scan QR → scan QR di atas</li>
                        <li>4. Masukkan <strong className="text-white/80">{usdtDisplay} USDT</strong> → kirim</li>
                      </ol>
                    ) : (
                      <ol className="text-xs text-white/50 space-y-1 list-none">
                        <li>1. Buka <strong className="text-white/80">Binance / OKX / Bybit</strong></li>
                        <li>2. Withdraw → <strong className="text-white/80">USDT</strong> → network <strong className="text-white/80">TRC-20</strong></li>
                        <li>3. Paste address atau scan QR</li>
                        <li>4. Masukkan <strong className="text-white/80">{usdtDisplay} USDT</strong> → kirim</li>
                      </ol>
                    )}
                  </div>

                  <button onClick={goBack}
                    className="w-full py-2.5 rounded-full text-sm font-bold transition-all mb-2"
                    style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                    ← Buat QR Baru
                  </button>
                  <button onClick={backToSelect}
                    className="w-full py-2 rounded-full text-xs"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Ganti Metode
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="content text-center py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-white/30 text-xs mb-3">
          © {new Date().getFullYear()} <span className="text-white/50 font-semibold">Arulfalah Nurwahid</span>. All rights reserved. · <span className="font-mono">{APP_VERSION}</span>
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)')}
        >
          ✉️ Konsultasi & Keluhan
        </button>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center px-4 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: '#2b2d31', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black uppercase text-white">Konsultasi & Keluhan</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">Nama Kamu</label>
                <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                  placeholder="Nama lengkap" className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')} />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">Pesan untuk Developer</label>
                <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)}
                  placeholder="Tulis pertanyaan, saran, atau keluhan kamu di sini..." rows={4}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')} />
              </div>
              <a href={`mailto:arulfalahnurwahid@gmail.com?subject=CryptoQRIS - Pesan dari ${encodeURIComponent(contactName)}&body=${encodeURIComponent(contactMsg)}`}
                onClick={() => setTimeout(() => setShowModal(false), 500)}
                className="block w-full py-3 rounded-full font-bold text-base text-center"
                style={{ backgroundColor: '#5865f2', color: '#fff' }}>
                Kirim Pesan
              </a>
              <p className="text-center text-xs mt-3 text-white/30">Akan dikirim ke arulfalahnurwahid@gmail.com</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
