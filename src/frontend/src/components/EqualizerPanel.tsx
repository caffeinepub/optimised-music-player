import { X } from "lucide-react";
import { EQ_PRESETS, useMusicStore } from "../lib/store";

interface EqualizerPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function EqualizerPanel({ open, onClose }: EqualizerPanelProps) {
  const {
    eqSettings,
    eqPreset,
    crossfade,
    setEQBand,
    setEQPreset,
    setCrossfade,
  } = useMusicStore();

  if (!open) return null;

  const presets = Object.keys(EQ_PRESETS);

  const sliderStyle = {
    accentColor: "#1DB954",
    width: "100%",
  };

  return (
    <div
      className="absolute bottom-full right-4 mb-2 rounded-xl shadow-2xl z-50 w-72 p-4"
      style={{ background: "#282828", border: "1px solid #404040" }}
      data-ocid="equalizer.panel"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-sm">Equalizer</p>
        <button
          type="button"
          onClick={onClose}
          className="text-[#b3b3b3] hover:text-white transition-colors"
          data-ocid="equalizer.close_button"
        >
          <X size={16} />
        </button>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <p className="text-xs text-[#b3b3b3] mb-2 uppercase tracking-wider">
          Preset
        </p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setEQPreset(p)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: eqPreset === p ? "#1DB954" : "#404040",
                color: eqPreset === p ? "#000" : "#fff",
              }}
              data-ocid="equalizer.button"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* EQ Sliders */}
      <div className="flex flex-col gap-3 mb-4">
        {(["bass", "mid", "treble"] as const).map((band) => (
          <div key={band}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#b3b3b3] capitalize">{band}</span>
              <span
                className="text-xs tabular-nums"
                style={{ color: "#1DB954" }}
              >
                {eqSettings[band] > 0 ? "+" : ""}
                {eqSettings[band]} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={eqSettings[band]}
              onChange={(e) => setEQBand(band, Number(e.target.value))}
              style={sliderStyle}
              data-ocid={`equalizer.${band}.input`}
            />
          </div>
        ))}
      </div>

      {/* Crossfade */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#b3b3b3]">Crossfade</span>
          <span className="text-xs tabular-nums" style={{ color: "#1DB954" }}>
            {crossfade}s
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={crossfade}
          onChange={(e) => setCrossfade(Number(e.target.value))}
          style={sliderStyle}
          data-ocid="equalizer.crossfade.input"
        />
      </div>
    </div>
  );
}
