'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'

const IDR_TO_USDT = 15500

export default function Home() {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactMsg, setContactMsg] = useState('')

  // Gunakan 6 desimal — USDT BEP-20 standarnya 6 desimal, bukan 18
  const usdtAmount = amount ? parseFloat((parseFloat(amount) / IDR_TO_USDT).toFixed(6)) : 0
  // Tampilan di UI cukup 2 desimal
  const usdtDisplay = usdtAmount ? parseFloat(usdtAmount.toFixed(2)) : 0

  // QR hanya berisi wallet address — paling universal, support semua wallet
  // (Binance, Trust Wallet, MetaMask, OKX, dll semua bisa scan wallet address biasa)
  const qrValue = wallet || ''

  function generate() {
    if (!wallet || !amount) return setError('Isi semua field!')
    if (!wallet.startsWith('0x') || wallet.length !== 42) return setError('Wallet address tidak valid')
    if (parseFloat(amount) <= 0) return setError('Nominal harus lebih dari 0')
    setError('')
    setShowQR(true)
  }

  function reset() {
    setShowQR(false)
    setWallet('')
    setAmount('')
  }

  function copyAddress() {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-discord min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="content flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">₿</span>
          <span className="font-bold text-xl text-white">CryptoQRIS</span>
        </div>
        <div className="text-xs text-white/40 px-3 py-1.5 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          BSC Mainnet · USDT BEP-20
        </div>
      </nav>

      <div className="content flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!showQR ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h1 className="text-4xl font-black uppercase text-center mb-2">BUAT QRIS CRYPTO</h1>
                <p className="text-center text-white/50 text-sm mb-8">
                  Gratis untuk siapa saja — terima crypto langsung ke wallet kamu tanpa ribet
                </p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-white/50">
                      Wallet Address Kamu (Penerima Dana)
                    </label>
                    <input
                      type="text"
                      value={wallet}
                      onChange={e => setWallet(e.target.value)}
                      placeholder="0x... (wallet BSC milik kamu)"
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
                    onClick={generate}
                    className="w-full py-3 rounded-full font-bold text-base transition-all"
                    style={{ backgroundColor: '#ffffff', color: '#404eed' }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '0.9')}
                    onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '1')}
                  >
                    ⚡ Buat QR Pembayaran
                  </button>

                  <p className="text-center text-xs mt-3 text-white/30">
                    100% gratis · Tidak perlu daftar · Langsung pakai
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-black uppercase text-center mb-1">SCAN & BAYAR</h1>
                <p className="text-center text-white/50 text-sm mb-6">
                  Scan QR pakai app crypto favoritmu
                </p>

                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                  {/* Supported wallets */}
                  <div className="flex justify-center gap-2 mb-5 flex-wrap">
                    {['MetaMask', 'Trust Wallet', 'Binance', 'OKX', 'Tokocrypto'].map(w => (
                      <span key={w} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* QR */}
                  <div className="flex justify-center mb-5">
                    <div className="p-4 rounded-xl bg-white">
                      {qrValue ? (
                        <QRCode value={qrValue} size={240} />
                      ) : (
                        <div className="w-60 h-60 flex items-center justify-center text-gray-400 text-xs">QR tidak tersedia</div>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-center rounded-xl py-4 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-4xl font-black text-white">
                      {usdtDisplay}
                      <span className="text-lg text-white/40 ml-2">USDT</span>
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      ≈ Rp {parseFloat(amount).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-widest">Atau copy address:</p>
                  <button
                    onClick={copyAddress}
                    className="w-full rounded-lg px-4 py-3 text-xs font-mono flex justify-between items-center mb-4 transition-all"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="truncate">{wallet}</span>
                    <span className="ml-2 shrink-0 font-bold" style={{ color: copied ? '#00d166' : '#5865f2' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>

                  {/* How to pay */}
                  <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.25)' }}>
                    <p className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wide">Cara bayar:</p>
                    <ol className="text-xs text-white/50 space-y-1 list-none">
                      <li>1. Buka app crypto kamu (Binance, Trust Wallet, MetaMask, OKX)</li>
                      <li>2. Pilih <span className="text-white/80 font-semibold">Send / Kirim</span> → pilih token <span className="text-white/80 font-semibold">USDT BEP-20</span></li>
                      <li>3. Tap ikon scan QR → scan QR di atas</li>
                      <li>4. Masukkan nominal <span className="text-white/80 font-semibold">{usdtDisplay} USDT</span> secara manual</li>
                      <li>5. Pastikan network: <span className="text-white/80 font-semibold">BNB Smart Chain (BSC)</span></li>
                      <li>6. Konfirmasi & kirim</li>
                    </ol>
                  </div>

                  {/* Reminder nominal */}
                  <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)' }}>
                    <p className="text-xs text-yellow-300/70">
                      ⚠️ QR hanya berisi <strong>alamat wallet</strong>. Masukkan nominal <strong>{usdtDisplay} USDT</strong> secara manual di app kamu.
                    </p>
                  </div>

                  <p className="text-xs text-center text-white/30 mb-4">Network: BNB Smart Chain (BSC Mainnet) · Token: USDT BEP-20</p>

                  <button
                    onClick={reset}
                    className="w-full py-2.5 rounded-full text-sm font-bold transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    ← Buat QR Baru
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
          © {new Date().getFullYear()} <span className="text-white/50 font-semibold">Arulfalah Nurwahid</span>. All rights reserved.
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
