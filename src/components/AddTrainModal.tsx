import React, { useState } from 'react';
import { X, Plus, Train, Zap, ShieldCheck } from 'lucide-react';
import { TrainJourney } from '../types';
import { createCustomTrain } from '../utils/trainFactory';

interface AddTrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrain: (train: TrainJourney) => Promise<void>;
}

export const AddTrainModal: React.FC<AddTrainModalProps> = ({
  isOpen,
  onClose,
  onAddTrain,
}) => {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [type, setType] = useState<TrainJourney['type']>('VANDE_BHARAT');
  const [zone, setZone] = useState<TrainJourney['zone']>('NR');
  const [originCode, setOriginCode] = useState('NDLS');
  const [originName, setOriginName] = useState('New Delhi');
  const [destCode, setDestCode] = useState('BSB');
  const [destName, setDestName] = useState('Varanasi Jn');
  const [currentDelayMinutes, setCurrentDelayMinutes] = useState(15);
  const [currentSpeedKmph, setCurrentSpeedKmph] = useState(130);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: {
    num: string;
    name: string;
    hindi: string;
    type: TrainJourney['type'];
    zone: TrainJourney['zone'];
    origCode: string;
    origName: string;
    destCode: string;
    destName: string;
    delay: number;
    speed: number;
  }) => {
    setTrainNumber(preset.num);
    setTrainName(preset.name);
    setHindiName(preset.hindi);
    setType(preset.type);
    setZone(preset.zone);
    setOriginCode(preset.origCode);
    setOriginName(preset.origName);
    setDestCode(preset.destCode);
    setDestName(preset.destName);
    setCurrentDelayMinutes(preset.delay);
    setCurrentSpeedKmph(preset.speed);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber.trim() || !trainName.trim()) {
      setErrorMessage('Train number and train name are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const newTrain = createCustomTrain({
        trainNumber,
        trainName,
        hindiName,
        type,
        zone,
        originCode,
        originName,
        destCode,
        destName,
        currentDelayMinutes,
        currentSpeedKmph,
      });

      await onAddTrain(newTrain);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add train');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Add Coaching Train to Radar
            </h2>
            <p className="text-xs text-slate-400">নতুন ট্রেন যোগ করুন (Dynamic Telemetry Input)</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Quick Demonstration Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  num: '22436',
                  name: 'Vande Bharat Express',
                  hindi: 'वंदे भारत एक्सप्रेस',
                  type: 'VANDE_BHARAT',
                  zone: 'NR',
                  origCode: 'NDLS',
                  origName: 'New Delhi',
                  destCode: 'BSB',
                  destName: 'Varanasi Jn',
                  delay: 8,
                  speed: 140,
                })
              }
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>#22436 Vande Bharat (NDLS → BSB)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleApplyPreset({
                  num: '12004',
                  name: 'Lucknow Swarna Shatabdi Express',
                  hindi: 'लखनऊ स्वर्ण शताब्दी',
                  type: 'SHATABDI',
                  zone: 'NR',
                  origCode: 'NDLS',
                  origName: 'New Delhi',
                  destCode: 'LKO',
                  destName: 'Lucknow Jn',
                  delay: 22,
                  speed: 120,
                })
              }
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>#12004 Shatabdi (NDLS → LKO)</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-700/60 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train Number *
              </label>
              <input
                type="text"
                required
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12301"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono-telemetry"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="VANDE_BHARAT">Vande Bharat Express</option>
                <option value="RAJDHANI">Rajdhani Express</option>
                <option value="SHATABDI">Shatabdi Express</option>
                <option value="SUPERFAST">Superfast Express</option>
                <option value="MAIL_EXPRESS">Mail / Express</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train Name (English) *
              </label>
              <input
                type="text"
                required
                value={trainName}
                onChange={(e) => setTrainName(e.target.value)}
                placeholder="e.g. Kolkata Rajdhani Express"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train Name (Hindi / स्थानीय नाम)
              </label>
              <input
                type="text"
                value={hindiName}
                onChange={(e) => setHindiName(e.target.value)}
                placeholder="e.g. कोलकाता राजधानी"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                <option value="NR">NR (Northern)</option>
                <option value="NCR">NCR (North Central)</option>
                <option value="ER">ER (Eastern)</option>
                <option value="ECR">ECR (East Central)</option>
                <option value="WR">WR (Western)</option>
                <option value="CR">CR (Central)</option>
                <option value="SR">SR (Southern)</option>
                <option value="ECoR">ECoR (East Coast)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Code</label>
              <input
                type="text"
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono-telemetry text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dest Code</label>
              <input
                type="text"
                value={destCode}
                onChange={(e) => setDestCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono-telemetry text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delay (mins)</label>
              <input
                type="number"
                min="0"
                value={currentDelayMinutes}
                onChange={(e) => setCurrentDelayMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono-telemetry text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel (বাতিল)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Adding...' : 'Add Train to Radar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
