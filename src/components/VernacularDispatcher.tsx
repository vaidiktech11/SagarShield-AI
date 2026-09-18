import React, { useState } from 'react';
import { CycloneProfile, DistrictAdvisory, InfrastructureAsset } from '../types';
import { DEFAULT_ADVISORY } from '../data/mockData';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Send, 
  Copy, 
  Check, 
  Languages, 
  FileCheck, 
  PhoneCall, 
  MessageSquare, 
  Sparkles, 
  RefreshCw,
  Building,
  Users
} from 'lucide-react';

interface VernacularDispatcherProps {
  cyclone: CycloneProfile;
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
}

export const VernacularDispatcher: React.FC<VernacularDispatcherProps> = ({
  cyclone,
  assets,
  selectedAsset,
}) => {
  const [selectedLang, setSelectedLang] = useState<'odia' | 'telugu' | 'bengali' | 'hindi' | 'english'>('odia');
  const [advisory, setAdvisory] = useState<DistrictAdvisory>(DEFAULT_ADVISORY);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Copy to clipboard helper
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Text to Speech Synthesizer for Vernacular siren/public address simulation
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt language matching
    if (selectedLang === 'hindi') utterance.lang = 'hi-IN';
    else if (selectedLang === 'bengali') utterance.lang = 'bn-IN';
    else if (selectedLang === 'telugu') utterance.lang = 'te-IN';
    else if (selectedLang === 'odia') utterance.lang = 'hi-IN'; // Fallback to Indian accent for Odia if native TTS not registered
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Trigger live Gemini re-generation of localized warnings
  const handleRegenerateVernacular = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/dispatch-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycloneName: cyclone.name,
          district: `${cyclone.state} Coastal District`,
          customNotes: `Storm surge predicted at +${cyclone.peakSurgeHeightMeters}m; coastal causeways cut off 6 hours prior to eye landfall`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisory((prev) => ({
          ...prev,
          english: {
            ...prev.english,
            districtMagistrateDirectives: [data.english.dmDirective],
            panchayatPublicSms: data.english.panchayatSms,
          },
          odia: {
            ...prev.odia,
            districtMagistrateDirectives: [data.odia.dmDirective],
            panchayatPublicSms: data.odia.panchayatSms,
          },
          telugu: {
            ...prev.telugu,
            districtMagistrateDirectives: [data.telugu.dmDirective],
            panchayatPublicSms: data.telugu.panchayatSms,
          },
          bengali: {
            ...prev.bengali,
            districtMagistrateDirectives: [data.bengali.dmDirective],
            panchayatPublicSms: data.bengali.panchayatSms,
          },
          hindi: {
            ...prev.hindi,
            districtMagistrateDirectives: [data.hindi.dmDirective],
            panchayatPublicSms: data.hindi.panchayatSms,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Simulate SMS/WhatsApp Broadcast to 48 Coastal Panchayats
  const handleSimulateDispatch = () => {
    setIsDispatching(true);
    setDispatchStatus('Connecting to State Disaster Management SMS & WhatsApp Gateway...');
    setTimeout(() => {
      setDispatchStatus('Formatting vernacular payloads for 48 Coastal Gram Panchayats...');
    }, 900);
    setTimeout(() => {
      setDispatchStatus('Broadcasting via Telecom Circle (Odisha / West Bengal cell broadcast)...');
    }, 1800);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchStatus('SUCCESS: Broadcast transmitted to 48 Sarpanches, 12 BDOs, and NDRF 3rd Battalion.');
    }, 2800);
  };

  const currentContent = advisory[selectedLang];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Automated Vernacular Alert Dispatcher
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                  Cloud Translation & TTS Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Converting hydrodynamic surge models into actionable directives for District Magistrates & Panchayat SMS alerts
              </p>
            </div>
          </div>
        </div>

        {/* Gemini Regenerate button */}
        <button
          onClick={handleRegenerateVernacular}
          disabled={isGeneratingAI}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
        >
          {isGeneratingAI ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-200" />
              <span>Translating with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Synthesize with Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Language Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400 flex items-center gap-1.5 pl-2 font-medium">
          <Languages className="w-4 h-4 text-cyan-400" />
          Broadcast Language:
        </span>

        <button
          onClick={() => setSelectedLang('odia')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedLang === 'odia'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>ଓଡ଼ିଆ (Odia)</span>
          <span className="text-[10px] font-mono opacity-80">Odisha</span>
        </button>

        <button
          onClick={() => setSelectedLang('telugu')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedLang === 'telugu'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>తెలుగు (Telugu)</span>
          <span className="text-[10px] font-mono opacity-80">Andhra Pradesh</span>
        </button>

        <button
          onClick={() => setSelectedLang('bengali')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedLang === 'bengali'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>বাংলা (Bengali)</span>
          <span className="text-[10px] font-mono opacity-80">West Bengal</span>
        </button>

        <button
          onClick={() => setSelectedLang('hindi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedLang === 'hindi'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>हिन्दी (Hindi)</span>
          <span className="text-[10px] font-mono opacity-80">National</span>
        </button>

        <button
          onClick={() => setSelectedLang('english')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            selectedLang === 'english'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>English</span>
          <span className="text-[10px] font-mono opacity-80">Official SOP</span>
        </button>
      </div>

      {/* Advisory Content Sections: Dual Format (Admin Directive vs Public SMS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel 1: District Magistrate & BDO Tactical Directive */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Building className="w-4 h-4 text-amber-400" />
                Administrative Directive (DM / BDOs / NDRF)
              </span>
              <button
                onClick={() => copyText(currentContent.districtMagistrateDirectives.join('\n'), 'dm')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Copy Directives"
              >
                {copiedKey === 'dm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'dm' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-sm font-bold text-white mb-2 leading-snug">
              {currentContent.title}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3 italic bg-slate-900/60 p-2.5 rounded border border-slate-800">
              {currentContent.executiveSummary}
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Action Checklist:
              </div>
              <ul className="space-y-1.5">
                {currentContent.districtMagistrateDirectives.map((directive, idx) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 bg-slate-900/40 p-2 rounded border border-slate-800/80">
                    <span className="font-mono text-cyan-400 font-bold text-[11px] mt-0.5">0{idx + 1}.</span>
                    <span>{directive}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Evacuation Deadline:</span>
            <strong className="text-rose-400 font-mono font-semibold">{currentContent.evacuationDeadline}</strong>
          </div>
        </div>

        {/* Channel 2: Coastal Gram Panchayat Public SMS & Siren Alert */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-400" />
                Gram Panchayat SMS / WhatsApp Broadcast
              </span>
              <button
                onClick={() => copyText(currentContent.panchayatPublicSms, 'sms')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Copy SMS text"
              >
                {copiedKey === 'sms' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sms' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Mobile SMS Simulation Box */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pb-2 border-b border-slate-800 mb-2">
                <span>RECIPIENTS: 48 PANCHAYAT SARPANCHES</span>
                <span>CH: CELL BROADCAST / WA</span>
              </div>
              <p className="text-xs text-slate-100 font-medium leading-relaxed font-sans">
                {currentContent.panchayatPublicSms}
              </p>
              <div className="text-[10px] text-slate-400 text-right mt-2 font-mono">
                Chars: {currentContent.panchayatPublicSms.length} | 1077 Helpline Active
              </div>
            </div>

            {/* Choke points warning callout */}
            <div className="mt-3 p-2.5 rounded bg-amber-950/30 border border-amber-900/60 text-xs text-amber-200">
              <strong className="text-amber-300">Ground Reality Reminder:</strong> Roads like Talchua causeway and SH-9 culvert km 42 will flood 6 to 12 hours before storm landfall. Do not delay evacuation convoys until high tide.
            </div>
          </div>

          {/* Action buttons: Speak Audio & Dispatch Broadcast */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => speakText(currentContent.panchayatPublicSms)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/80'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span>Stop Broadcast Siren</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Test Vernacular Audio Siren (TTS)</span>
                </>
              )}
            </button>

            <button
              onClick={handleSimulateDispatch}
              disabled={isDispatching}
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'Transmitting...' : 'Dispatch to 48 Panchayats'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Simulation Progress Status Banner */}
      {dispatchStatus && (
        <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between border ${
          dispatchStatus.includes('SUCCESS')
            ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-300'
            : 'bg-cyan-950/50 border-cyan-700/80 text-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{dispatchStatus}</span>
          </div>
          <button
            onClick={() => setDispatchStatus(null)}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
