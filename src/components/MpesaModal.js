'use client';

import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiSmartphone,
  FiAlertCircle,
  FiX,
  FiLock,
  FiSettings,
  FiPhoneCall,
  FiVolume2,
  FiSend,
  FiInfo,
} from 'react-icons/fi';
import { formatKsh } from '@/data/products';

// Play Safaricom STK Push Chime using Web Audio API
function playSafaricomChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {}
}

// Trigger physical handset vibration
function triggerPhoneVibrate() {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 150, 300, 150, 450]);
    }
  } catch (e) {}
}

export default function MpesaModal({
  isOpen,
  onClose,
  amount,
  phone,
  orderId,
  tillNumber = '829103',
  onSuccess,
}) {
  const [step, setStep] = useState('prompt'); // 'prompt' | 'pin' | 'processing' | 'confirmed'
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [receiptCode, setReceiptCode] = useState('');
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [liveDarajaTriggered, setLiveDarajaTriggered] = useState(false);
  const [showDarajaSettings, setShowDarajaSettings] = useState(false);

  // Safaricom Daraja Keys
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [passkey, setPasskey] = useState('');
  const [shortcode, setShortcode] = useState('174379');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setConsumerKey(localStorage.getItem('daraja_key') || '');
        setConsumerSecret(localStorage.getItem('daraja_secret') || '');
        setPasskey(localStorage.getItem('daraja_passkey') || '');
        setShortcode(localStorage.getItem('daraja_shortcode') || '174379');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      setPin('');
      setPinError('');
      setCountdown(60);
      setReceiptCode('QKM' + Math.random().toString(36).substring(2, 8).toUpperCase());

      playSafaricomChime();
      triggerPhoneVibrate();

      initiateStkPush();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && step === 'prompt' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, countdown]);

  const initiateStkPush = async (overrideKeys = null) => {
    setIsCallingApi(true);
    setApiMessage('Connecting to Safaricom Daraja Gateway...');

    const keys = overrideKeys || {
      consumerKey: consumerKey.trim() || undefined,
      consumerSecret: consumerSecret.trim() || undefined,
      passkey: passkey.trim() || undefined,
      shortcode: shortcode.trim() || undefined,
    };

    try {
      const res = await fetch('/api/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount,
          orderId,
          branchTill: tillNumber,
          ...keys,
        }),
      });

      const data = await res.json();
      setIsCallingApi(false);

      if (data.success) {
        setApiMessage(data.CustomerMessage);
        setLiveDarajaTriggered(Boolean(data.liveDarajaInitiated));
        if (data.simulatedReceipt) {
          setReceiptCode(data.simulatedReceipt);
        }
      } else {
        setApiMessage(data.message || 'Ready to complete payment');
        setLiveDarajaTriggered(false);
      }
    } catch (err) {
      setIsCallingApi(false);
      setLiveDarajaTriggered(false);
      setApiMessage('Ready to complete payment');
    }
  };

  const handleSaveDarajaKeys = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('daraja_key', consumerKey.trim());
      localStorage.setItem('daraja_secret', consumerSecret.trim());
      localStorage.setItem('daraja_passkey', passkey.trim());
      localStorage.setItem('daraja_shortcode', shortcode.trim());
    }
    setShowDarajaSettings(false);
    initiateStkPush({
      consumerKey: consumerKey.trim(),
      consumerSecret: consumerSecret.trim(),
      passkey: passkey.trim(),
      shortcode: shortcode.trim(),
    });
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setPinError('Please enter your 4-digit M-Pesa PIN');
      return;
    }
    setStep('processing');
    setTimeout(() => {
      setStep('confirmed');
      playSafaricomChime();
      triggerPhoneVibrate();

      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            receiptNumber: receiptCode,
            phone,
            amount,
            timestamp: new Date().toISOString(),
          });
        }
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Header */}
        <div className="bg-[#009639] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-[#009639] flex items-center justify-center font-black text-sm shadow">
              M
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-green-100">
                Lipa na M-Pesa
              </p>
              <h3 className="font-bold text-xs sm:text-sm">Hand Phone Payment Prompt</h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDarajaSettings(!showDarajaSettings)}
              title="Configure Real Daraja Air Push"
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              aria-label="Daraja Settings"
            >
              <FiSettings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
              aria-label="Close prompt"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Daraja Keys Configuration Drawer */}
          {showDarajaSettings && (
            <form
              onSubmit={handleSaveDarajaKeys}
              className="bg-gray-50 border border-green-300 rounded-2xl p-4 text-xs space-y-2.5 animate-in slide-in-from-top-2"
            >
              <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                <span className="font-black text-gray-900">Safaricom Daraja API Keys</span>
                <span className="text-[10px] text-green-700 font-bold">Real Handset Push</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                To send an actual air push directly to your physical hand phone, Safaricom requires your Daraja App credentials from{' '}
                <a
                  href="https://developer.safaricom.co.ke/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-700 underline font-bold"
                >
                  developer.safaricom.co.ke
                </a>:
              </p>
              <div>
                <label className="block text-[10px] font-bold text-gray-700">Consumer Key:</label>
                <input
                  type="text"
                  required
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="Paste Consumer Key from Daraja"
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700">Consumer Secret:</label>
                <input
                  type="password"
                  required
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  placeholder="Paste Consumer Secret from Daraja"
                  className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-700">Shortcode / Till:</label>
                  <input
                    type="text"
                    value={shortcode}
                    onChange={(e) => setShortcode(e.target.value)}
                    placeholder="174379 or Till"
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-700">Passkey:</label>
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Passkey"
                    className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-[#009639] hover:bg-[#008231] text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <FiSend className="w-3.5 h-3.5" />
                  <span>Send Real Air Push to Hand Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDarajaSettings(false)}
                  className="px-3 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {step === 'prompt' && (
            <div className="space-y-4 text-center">
              {/* Hand Phone Notice Banner */}
              {liveDarajaTriggered ? (
                <div className="bg-green-50 border border-green-300 rounded-2xl p-3 text-left flex items-start gap-2.5">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-extrabold text-green-900">
                      Live STK Push Sent to Your Hand Phone!
                    </p>
                    <p className="text-[11px] text-green-800 mt-0.5">
                      Check your physical mobile screen now. Safaricom has displayed the PIN prompt on your handset.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-left flex items-start gap-2.5">
                  <FiInfo className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-950">
                      Sending Real Prompt to Hand Phone:
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      To send an over-the-air prompt to your physical phone, tap <strong>&quot;Open on Hand Phone (*334#)&quot;</strong> below, or tap <strong>&quot;Configure Daraja Keys&quot;</strong> to link your live Safaricom API.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <span className="inline-block bg-green-100 text-[#009639] font-bold text-xs px-3 py-0.5 rounded-full mb-1">
                  Target Hand Phone: <strong>{phone}</strong>
                </span>
                <h4 className="text-2xl font-black text-gray-900 mt-1">
                  Pay {formatKsh(amount)}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  To: <strong>QUICKMART SUPERMARKET TILL {tillNumber}</strong>
                </p>
              </div>

              {/* Hand Phone Action 1: Direct M-Pesa SIM USSD Trigger */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={`tel:*334*1*${tillNumber}*${amount}%23`}
                  onClick={() => {
                    playSafaricomChime();
                    triggerPhoneVibrate();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#009639] hover:bg-[#008231] active:scale-98 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg transition-all"
                >
                  <FiPhoneCall className="w-4 h-4" />
                  <span>Launch M-Pesa on Hand Phone (*334#)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowDarajaSettings(true)}
                  className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-[#009639] border border-green-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  <FiSettings className="w-3.5 h-3.5" />
                  <span>Configure Live Safaricom Daraja Keys</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('pin')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  <FiLock className="w-3.5 h-3.5" />
                  <span>Or Enter PIN On Screen (Demo Mode)</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                <span>Prompt expires in: <strong className="text-orange-600">{countdown}s</strong></span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#009639] mb-1">
                  <FiLock className="w-6 h-6" />
                </div>
                <h4 className="font-black text-gray-900 text-base">Enter M-Pesa PIN</h4>
                <p className="text-xs text-gray-500">
                  Authorizing payment of <strong>{formatKsh(amount)}</strong> to Quickmart
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center tracking-[1.5em] text-2xl font-bold py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#009639] focus:outline-none"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 flex items-center justify-center gap-1 font-bold">
                    <FiAlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
                <p className="text-[11px] text-gray-400 text-center">
                  (Type any 4 digits, e.g. 1234, to simulate instant verification)
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('prompt')}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#009639] hover:bg-[#008231] text-white font-black text-xs shadow-md"
                >
                  Confirm PIN
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 border-4 border-[#009639] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-black text-gray-900 text-sm">Contacting Safaricom Daraja...</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Reconciling payment of {formatKsh(amount)} with Quickmart Supermarket Till {tillNumber}
                </p>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#009639]">
                <FiCheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black text-green-800 bg-green-100 px-3 py-1 rounded-full uppercase">
                  Payment Confirmed
                </span>
                <h4 className="text-lg font-black text-gray-900 mt-2">
                  {formatKsh(amount)} Received!
                </h4>
                <p className="font-mono text-xs font-bold text-gray-700 mt-0.5">
                  Ref: {receiptCode}
                </p>
              </div>

              {/* Safaricom SMS Notification Preview */}
              <div className="bg-gray-900 text-green-400 p-3.5 rounded-2xl text-left font-mono text-[11px] leading-relaxed border border-gray-800 shadow-md">
                <p className="text-gray-400 text-[10px] mb-1 font-sans">Safaricom Confirmation SMS:</p>
                &quot;{receiptCode} Confirmed. Ksh {Number(amount).toLocaleString()} paid to QUICKMART SUPERMARKET TILL {tillNumber} on {new Date().toLocaleDateString('en-KE')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Thank you for shopping fresh at Quickmart!&quot;
              </div>

              <p className="text-xs text-gray-500 animate-pulse">
                Order finalized. Generating official tax receipt...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
