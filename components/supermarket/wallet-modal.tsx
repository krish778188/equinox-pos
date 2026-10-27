"use client"

import { useState, useEffect } from "react"
import { X, Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw, Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/pos-data"

type WalletTransaction = {
  id: number
  amount: number
  type: "CREDIT" | "DEBIT"
  description: string
  reference_id: string
  created_at: string
}

type WalletModalProps = {
  isOpen: boolean
  onClose: () => void
  user: any
  onBalanceUpdate?: (newBalance: number) => void
}

export function WalletModal({ isOpen, onClose, user, onBalanceUpdate }: WalletModalProps) {
  const [balance, setBalance] = useState<number>(Number(user?.wallet_balance || 0))
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWallet = async () => {
    if (!user?.email) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/user/wallet?email=${encodeURIComponent(user.email)}&t=${Date.now()}`, {
        cache: "no-store"
      })
      const data = await res.json()
      if (data.success) {
        setBalance(data.wallet_balance)
        setTransactions(data.transactions || [])
        onBalanceUpdate?.(data.wallet_balance)
      }
    } catch (e) {
      console.error("Failed to load wallet:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && user?.email) {
      fetchWallet()
    }
  }, [isOpen, user?.email])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-lg rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl text-stone-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-700/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>Equinox Wallet</span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Instant Credit
                </span>
              </h3>
              <p className="text-xs text-stone-400">Cash on Delivery refund balance &amp; store credit</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchWallet}
              disabled={isLoading}
              title="Refresh Wallet Balance"
              className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="mt-5 rounded-3xl border border-emerald-600/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-xl shadow-emerald-900/15 relative overflow-hidden">
          <div 
            aria-hidden 
            className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" 
          />
          <div className="flex items-center justify-between text-xs text-emerald-100/90 font-medium">
            <span>Available Wallet Balance</span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-100 border border-white/20">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              100% Redeemable
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(balance)}
            </span>
          </div>

          <p className="mt-3 text-[11px] text-emerald-100/80 leading-relaxed">
            Your Cash on Delivery (COD) return refunds are credited here upon admin approval and can be redeemed automatically on any future order.
          </p>
        </div>

        {/* How It Works Notice */}
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <p className="font-bold text-emerald-950">How Equinox Wallet Works:</p>
            <p className="mt-0.5 text-emerald-800">
              • When returning a <strong>Cash on Delivery (COD)</strong> order, the refund amount goes directly into this wallet.
            </p>
            <p className="text-emerald-800">
              • During your next order checkout, check <strong>"Use Equinox Wallet"</strong> to apply this balance instantly.
            </p>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Wallet History
            </h4>
            <span className="text-[10px] text-stone-400">
              {transactions.length} record{transactions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
            {isLoading && transactions.length === 0 ? (
              <div className="flex h-24 items-center justify-center gap-2 text-xs text-stone-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Loading wallet history...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-4 text-center text-xs text-stone-400">
                <Wallet className="h-6 w-6 text-stone-300" />
                <p className="font-semibold text-stone-600">No transactions yet</p>
                <p className="text-[10px]">Your Cash on Delivery return credits will appear here.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/70 p-3 text-xs transition hover:bg-stone-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                        tx.type === "CREDIT"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {tx.type === "CREDIT" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-800">{tx.description}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs shrink-0 ml-3 ${
                      tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
