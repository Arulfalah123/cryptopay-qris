'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'

const APP_VERSION = 'v0.5'
const IDR_TO_USDT = 15500

// Contract addresses
const USDT_BSC  = '0x55d398326f99059fF775485246999027B3197955'
const USDT_TRC  = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT TRC-20 contract (info only)

type PayMode = 'select' | 'crypto' | 'qris'
type CryptoNetwork = 'bsc' | 'trc20'

export default function Home() {
  const [payMode, setPayMode]       = useState<PayMode>('select')
  const [network, setNetwork]       = useState<CryptoNetwork>('bsc')
  const [wallet, setWallet]         = useState('')
  const [amount, setAmount]         = useState('')
  const [showQR, setShowQR]         = useState(false)
  const [copied, setCopied]         = useState(false)
  const [copiedContract, setCopiedContract] = useState(false)
  const [error, setError]           = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactMsg, setContactMsg]   = useState('')

  const usdtAmount  = amount ? parseFloat((parseFloat(amount) / IDR_TO_USDT).toFixed(6)) : 0
  const usdtDisplay = usdtAmount ? parseFloat(usdtAmount.toFixed(2)) : 0
  const qrValue     = wallet || ''

  const networkLabel = network === 'bsc' ? 'BNB Smart Chain (BSC / BEP-20)' : 'TRON (TRC-20)'
  const contractAddr = network === 'bsc' ? USDT_BSC : USDT_TRC

  function generate() {
    if (!wallet || !amount) return setError('Isi semua field!')
    const isValidEVM  = wallet.startsWith('0x') && wallet.length === 42
    const isValidTRON = wallet.startsWith('T') && wallet.length === 34
    if (network === 'bsc'   && !isValidEVM)  return setError('Wallet BSC harus mulai 0x, 42 karakter')
    if (network === 'trc20' && !isValidTRON) return setError('Wallet TRON harus mulai T, 34 karakter')
    if (parseFloat(amount) <= 0) return setError('Nominal harus lebih dari 0')
    setError('')
    setShowQR(true)
  }

  function reset() {
    setShowQR(false)
    setWallet('')
    setAmount('')
    setError('')
  }

  function backToSelect() {
    reset()
    setPayMode('select')
    setNetwork('bsc')
  }

  function copyAddress() {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyContract() {
    navigator.clipboard.writeText(contractAddr)
    setCopiedContract(true)
    setTimeout(() => setCopiedContract(false), 2000)
  }

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

            {/* ── STEP 1: PILIH METODE ── */}
            {payMode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-4xl font-black uppercase text-center mb-2">BUAT QR BAYAR</h1>
                <p className="text-center text-white/50 text-sm mb-8">
                  Pilih metode pembayaran yang sesuai dengan pembelimu
                </p>

                <div className="space-y-4">
                  {/* Pilihan Crypto */}
                  <button
                    onClick={() => setPayMode('crypto')}
                    className="w-full rounded-2xl p-5 text-left transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '2px solid rgba(88,101,242,0.4)' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💎</span>
                      <div>
                        <p className="font-black text-white text-base">Bayar Pakai Crypto</p>
                        <p className="text-xs text-white/50">USDT · BSC atau TRC-20</p>
                      </div>
                      <span className="ml-auto text-white/40">→</span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {['Trust Wallet', 'MetaMask', 'OKX', 'Binance'].map(w => (
                        <span key={w} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(88,101,242,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* Pilihan QRIS IDR */}
                  <div
                    className="w-full rounded-2xl p-5 text-left relative overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}
                  >
                    {/* Badge segera hadir */}
                    <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: 'rgba(255,170,0,0.2)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                      🔜 Segera Hadir
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🏦</span>
                      <div>
                        <p className="font-black text-white/50 text-base">Bayar Pakai QRIS IDR</p>
                        <p className="text-xs text-white/30">GoPay · Dana · OVO · BCA · dll</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Integrasi dengan Midtrans/Xendit coming soon. Pembeli bayar IDR, kamu terima IDR.
                    </p>
                  </div>
                </div>

                <p className="text-center text-xs mt-6 text-white/20">
                  100% gratis · Tidak perlu daftar · Langsung pakai
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: FORM CRYPTO ── */}
            {payMode === 'crypto' && !showQR && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <button onClick={backToSelect} className="flex items-center gap-1 text-xs text-white/40 mb-5 hover:text-white/70 transition-colors">
                  ← Kembali
                </button>
                <h1 className="text-3xl font-black uppercase text-center mb-1">BUAT QR CRYPTO</h1>
                <p className="text-center text-white/50 text-sm mb-6">Isi detail pembayaran kamu</p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>

                  {/* Pilih Network */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                      Pilih Network USDT
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setNetwork('bsc'); setWallet(''); setError('') }}
                        className="rounded-xl py-3 px-3 text-sm font-bold transition-all"
                        style={{
                          backgroundColor: network === 'bsc' ? 'rgba(88,101,242,0.3)' : 'rgba(0,0,0,0.3)',
                          border: network === 'bsc' ? '2px solid #5865f2' : '2px solid rgba(255,255,255,0.1)',
                          color: network === 'bsc' ? '#fff' : 'rgba(255,255,255,0.4)'
                        }}
                      >
                        <p className="font-black">BSC / BEP-20</p>
                        <p className="text-xs font-normal opacity-70 mt-1">Wallet address: <span className="font-mono">0x...</span></p>
                        <p className="text-xs font-normal opacity-50 mt-1">Trust Wallet · MetaMask · OKX Wallet</p>
                      </button>
                      <button
                        onClick={() => { setNetwork('trc20'); setWallet(''); setError('') }}
                        className="rounded-xl py-3 px-3 text-sm font-bold transition-all"
                        style={{
                          backgroundColor: network === 'trc20' ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.3)',
                          border: network === 'trc20' ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.1)',
                          color: network === 'trc20' ? '#fff' : 'rgba(255,255,255,0.4)'
                        }}
                      >
                        <p className="font-black">TRC-20</p>
                        <p className="text-xs font-normal opacity-70 mt-1">Wallet address: <span className="font-mono">T...</span></p>
                        <p className="text-xs font-normal opacity-50 mt-1">Binance · OKX · Bybit exchange</p>
                      </button>
                    </div>
                    {network === 'trc20' && (
                      <div className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.8)' }}>
                        💡 Untuk pembeli yang kirim dari <strong>Binance/OKX exchange</strong> via Withdraw. Wallet kamu harus support TRON (address mulai <strong>T...</strong>)
                      </div>
                    )}
                    {network === 'bsc' && (
                      <div className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)', color: 'rgba(150,160,255,0.9)' }}>
                        💡 Untuk pembeli yang pakai <strong>Trust Wallet atau MetaMask</strong>. Wallet kamu harus BSC (address mulai <strong>0x...</strong>)
                      </div>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                      Wallet Address Kamu ({network === 'bsc' ? 'BSC/BEP-20' : 'TRON/TRC-20'})
                    </label>
                    <input
                      type="text"
                      value={wallet}
                      onChange={e => setWallet(e.target.value)}
                      placeholder={network === 'bsc' ? '0x... (42 karakter)' : 'T... (34 karakter)'}
                      className="w-full rounded-lg px-4 py-3 text-sm font-mono outline-none"
                      style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                      onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                    />
                  </div>

                  {/* Nominal */}
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
                    onClick={generate}
                    className="w-full py-3 rounded-full font-bold text-base transition-all"
                    style={{ backgroundColor: '#ffffff', color: '#404eed' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '0.9')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '1')}
                  >
                    ⚡ Buat QR Pembayaran
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: QR PAGE ── */}
            {payMode === 'crypto' && showQR && (
              <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-black uppercase text-center mb-1">SCAN & BAYAR</h1>
                <p className="text-center text-white/50 text-sm mb-6">
                  Tunjukkan QR ini ke pembeli
                </p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>

                  {/* Network badge */}
                  <div className="flex justify-center mb-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: network === 'bsc' ? 'rgba(88,101,242,0.2)' : 'rgba(239,68,68,0.2)',
                        color: network === 'bsc' ? '#a5b4fc' : '#fca5a5',
                        border: `1px solid ${network === 'bsc' ? 'rgba(88,101,242,0.4)' : 'rgba(239,68,68,0.4)'}`
                      }}>
                      {network === 'bsc' ? '🔵 BSC / BEP-20' : '🔴 TRON / TRC-20'}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-3">
                    <div className="p-4 rounded-xl bg-white">
                      <QRCode value={qrValue} size={240} />
                    </div>
                  </div>
                  <p className="text-center text-xs text-white/30 mb-4">
                    Scan dari dalam app crypto · Bukan dari kamera HP
                  </p>

                  {/* Amount */}
                  <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs text-white/40 text-center mb-1 uppercase tracking-widest">Kirim tepat sebesar</p>
                    <p className="text-4xl font-black text-white text-center">
                      {usdtDisplay}
                      <span className="text-lg text-white/40 ml-2">USDT</span>
                    </p>
                    <p className="text-sm text-white/40 text-center mt-1">
                      ≈ Rp {parseFloat(amount).toLocaleString('id-ID')}
                    </p>
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs font-bold text-center" style={{ color: network === 'bsc' ? '#a5b4fc' : '#fca5a5' }}>
                        ⚠️ Wajib kirim via {networkLabel}
                      </p>
                    </div>
                  </div>

                  {/* Copy Address */}
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Wallet address penerima:</p>
                  <button
                    onClick={copyAddress}
                    className="w-full rounded-lg px-4 py-3 text-xs font-mono flex justify-between items-center mb-3 transition-all"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="truncate">{wallet}</span>
                    <span className="ml-2 shrink-0 font-bold" style={{ color: copied ? '#00d166' : '#5865f2' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>

                  {/* Copy Contract */}
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Contract USDT {network === 'bsc' ? 'BEP-20' : 'TRC-20'}:</p>
                  <button
                    onClick={copyContract}
                    className="w-full rounded-lg px-3 py-2.5 text-xs font-mono flex justify-between items-center mb-4 transition-all"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="truncate text-white/50">{contractAddr}</span>
                    <span className="ml-2 shrink-0 font-bold text-xs" style={{ color: copiedContract ? '#00d166' : '#5865f2' }}>
                      {copiedContract ? '✓' : 'Copy'}
                    </span>
                  </button>

                  {/* Cara Bayar */}
                  <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)' }}>
                    <p className="text-xs font-bold text-white/70 mb-3 uppercase tracking-wide">📱 Cara pembeli bayar:</p>
                    {network === 'bsc' ? (
                      <ol className="text-xs text-white/50 space-y-1 list-none">
                        <li>1. Buka <strong className="text-white/80">Trust Wallet</strong> atau <strong className="text-white/80">MetaMask</strong></li>
                        <li>2. Tap <strong className="text-white/80">Send</strong> → pilih <strong className="text-white/80">USDT BEP-20</strong></li>
                        <li>3. Tap ikon scan QR → scan QR di atas</li>
                        <li>4. Masukkan <strong className="text-white/80">{usdtDisplay} USDT</strong> → kirim</li>
                      </ol>
                    ) : (
                      <ol className="text-xs text-white/50 space-y-1 list-none">
                        <li>1. Buka <strong className="text-white/80">Binance</strong> / <strong className="text-white/80">OKX</strong> / <strong className="text-white/80">Bybit</strong></li>
                        <li>2. Pilih <strong className="text-white/80">Withdraw</strong> → token <strong className="text-white/80">USDT</strong></li>
                        <li>3. Pilih network <strong className="text-white/80">TRC-20</strong></li>
                        <li>4. Scan QR atau paste address penerima</li>
                        <li>5. Masukkan <strong className="text-white/80">{usdtDisplay} USDT</strong> → kirim</li>
                      </ol>
                    )}
                  </div>

                  <p className="text-xs text-center text-white/20 mb-4">Network: {networkLabel} · Token: USDT</p>

                  <button
                    onClick={reset}
                    className="w-full py-2.5 rounded-full text-sm font-bold transition-all mb-2"
                    style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    ← Buat QR Baru
                  </button>
                  <button
                    onClick={backToSelect}
                    className="w-full py-2 rounded-full text-xs transition-all"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    Ganti Metode Pembayaran
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

      {/* Modal Konsultasi */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center px-4 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: '#2b2d31', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black uppercase text-white">Konsultasi & Keluhan</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">Nama Kamu</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">Pesan untuk Developer</label>
                <textarea
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  placeholder="Tulis pertanyaan, saran, atau keluhan kamu di sini..."
                  rows={4}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
                  style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => (e.target.style.border = '1px solid #5865f2')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.12)')}
                />
              </div>
              <a
                href={`mailto:arulfalahnurwahid@gmail.com?subject=CryptoQRIS - Pesan dari ${encodeURIComponent(contactName)}&body=${encodeURIComponent(contactMsg)}`}
                onClick={() => setTimeout(() => setShowModal(false), 500)}
                className="block w-full py-3 rounded-full font-bold text-base text-center transition-all"
                style={{ backgroundColor: '#5865f2', color: '#fff' }}
              >
                Kirim Pesan
              </a>
              <p className="text-center text-xs mt-3 text-white/30">
                Akan dikirim ke arulfalahnurwahid@gmail.com
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
