import React, { useState, useRef } from 'react';
import { Camera, Upload, Link, X, Check, Image as ImageIcon, Eye } from 'lucide-react';
import { audioHaptics } from '../../services/audioHaptics';

interface PhotoUploadInputProps {
  currentPhotoUrl?: string;
  onPhotoSelected: (dataUrl: string, altText?: string) => void;
  onRemovePhoto?: () => void;
  label?: string;
  altTextLabel?: string;
  initialAltText?: string;
  showAltTextInput?: boolean;
  shape?: 'circle' | 'square' | 'card';
  className?: string;
}

export const PhotoUploadInput: React.FC<PhotoUploadInputProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  onRemovePhoto,
  label = 'Profile Photo',
  altTextLabel = 'Photo Visual Description (Alt-Text for Screen Readers)',
  initialAltText = '',
  showAltTextInput = true,
  shape = 'circle',
  className = ''
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'camera'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState(initialAltText);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Resize and compress image file to Base64 (max dimension 800px)
  const processImageFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          audioHaptics.triggerTap();
          onPhotoSelected(compressedDataUrl, altText);
        } else {
          onPhotoSelected(result, altText);
        }
      };
      img.onerror = () => {
        setErrorMsg('Failed to process image. Please try another.');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setErrorMsg(null);
    audioHaptics.triggerTap();
    onPhotoSelected(urlInput.trim(), altText);
    setUrlInput('');
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (err) {
      setErrorMsg('Camera access unavailable or declined.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!cameraVideoRef.current) return;
    const video = cameraVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      audioHaptics.triggerMatch();
      onPhotoSelected(dataUrl, altText);
      stopCamera();
    }
  };

  const shapeClasses = {
    circle: 'w-24 h-24 sm:w-28 sm:h-28 rounded-full',
    square: 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl',
    card: 'w-full h-44 rounded-2xl'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-neutral-300">
          {label}
        </label>
      )}

      {/* Main Preview & Action Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800">
        {/* Photo Preview or Placeholder */}
        <div className="relative group flex-shrink-0">
          <div className={`${shapeClasses[shape]} overflow-hidden bg-neutral-900 border-2 border-rose-500/50 shadow-md flex items-center justify-center relative`}>
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt={altText || 'User photo'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-500 p-2 text-center">
                <ImageIcon className="w-8 h-8 text-neutral-600 mb-1" />
                <span className="text-[10px]">No photo</span>
              </div>
            )}

            {/* Hover overlay to change */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold gap-1"
            >
              <Upload className="w-4 h-4 text-rose-400" />
              <span>Change</span>
            </div>
          </div>

          {currentPhotoUrl && onRemovePhoto && (
            <button
              type="button"
              onClick={() => {
                audioHaptics.triggerTap();
                onRemovePhoto();
              }}
              title="Remove photo"
              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md border border-neutral-950 transition-transform active:scale-95"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Input Methods Switcher */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveMode('upload');
                stopCamera();
              }}
              className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                activeMode === 'upload' ? 'bg-rose-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('camera');
                startCamera();
              }}
              className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                activeMode === 'camera' ? 'bg-rose-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Snap Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('url');
                stopCamera();
              }}
              className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
                activeMode === 'url' ? 'bg-rose-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Link className="w-3 h-3" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Upload Method Content */}
          {activeMode === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                  : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 text-xs font-medium">
                <Upload className="w-4 h-4 text-rose-400" />
                <span>Click to browse or drag & drop photo</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">JPEG, PNG, WEBP (auto-compressed)</p>
            </div>
          )}

          {/* Camera Method Content */}
          {activeMode === 'camera' && (
            <div className="space-y-2">
              {isCameraActive ? (
                <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-700 aspect-video max-h-40 flex items-center justify-center">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="absolute bottom-2 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Snapshot</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          )}

          {/* URL Method Content */}
          {activeMode === 'url' && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Screen Reader Visual Description (Alt-Text) */}
      {showAltTextInput && (
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>{altTextLabel}</span>
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => {
              setAltText(e.target.value);
              if (currentPhotoUrl) {
                onPhotoSelected(currentPhotoUrl, e.target.value);
              }
            }}
            placeholder="e.g. Portrait smiling outdoors with warm lighting, wearing a navy jacket..."
            className="w-full bg-neutral-950 border border-neutral-700 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
          <p className="text-[10px] text-neutral-400">
            Enables daters who use screen readers to experience and visualize your photo.
          </p>
        </div>
      )}
    </div>
  );
};
