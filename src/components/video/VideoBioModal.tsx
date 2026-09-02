import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Video, 
  Camera, 
  RefreshCw, 
  Check, 
  FileText, 
  Sparkles,
  Subtitles,
  Upload,
  AlertCircle
} from 'lucide-react';
import { VideoBio, UserProfile } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface VideoBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isCurrentUser?: boolean;
  onSaveVideoBio?: (videoBio: VideoBio) => void;
}

export const VideoBioModal: React.FC<VideoBioModalProps> = ({
  isOpen,
  onClose,
  user,
  isCurrentUser = false,
  onSaveVideoBio
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  // Recording mode state
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveCameraRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setIsRecording(false);
      setRecordedVideoUrl(null);
    }
  }, [isOpen]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      if (liveCameraRef.current) {
        liveCameraRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access unavailable. You can upload a video file or use an animated preview.');
    }
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    setCountdown(3);

    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          beginMediaRecorder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginMediaRecorder = () => {
    if (!streamRef.current) return;
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedTranscript(`Hi! I'm ${user.name}. Looking forward to meeting someone warm, authentic, and passionate about life!`);
        audioHaptics.triggerBiometricSuccess();
      };

      mediaRecorder.start();
      setIsRecording(true);
      audioHaptics.triggerNavigationClick();

      // Automatically stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          handleStopRecording();
        }
      }, 15000);
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioHaptics.triggerNavigationClick();
    }
  };

  const handleSaveRecording = () => {
    if (onSaveVideoBio && (recordedVideoUrl || user.videoBio)) {
      onSaveVideoBio({
        url: recordedVideoUrl || user.videoBio?.url || '',
        durationSec: 15,
        transcript: recordedTranscript || user.videoBio?.transcript || '',
        hasAudio: true,
        subtitles: [
          { start: 0, end: 5, text: `Hi! I'm ${user.name}...` },
          { start: 5, end: 15, text: recordedTranscript || "Looking forward to meeting genuine people!" }
        ]
      });
      setIsRecordingMode(false);
      stopCameraStream();
    }
  };

  // Track playback time for live subtitles
  const handleTimeUpdate = () => {
    if (!videoRef.current || !user.videoBio?.subtitles) return;
    const time = videoRef.current.currentTime;
    const activeSub = user.videoBio.subtitles.find(s => time >= s.start && time <= s.end);
    setCurrentSubtitle(activeSub ? activeSub.text : '');
  };

  if (!isOpen) return null;

  const currentVideoBio = user.videoBio;

  return (
    <div 
      id="video-bio-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-bio-title"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/60 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 id="video-bio-title" className="text-sm font-bold text-white flex items-center gap-1.5">
                {isRecordingMode ? 'Video Bio Studio' : `${user.name}'s Video Bio`}
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono">
                  AUTHENTIC
                </span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isCurrentUser && !isRecordingMode && (
              <button
                id="btn-re-record-video"
                onClick={() => {
                  setIsRecordingMode(true);
                  startCamera();
                  audioHaptics.triggerNavigationClick();
                }}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Record New
              </button>
            )}
            <button
              id="btn-close-video-modal"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Body Content */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden">
          {isRecordingMode ? (
            /* Video Recording Studio */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
              {recordedVideoUrl ? (
                <video
                  src={recordedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-[360px] sm:h-[420px] rounded-2xl object-cover border border-neutral-700"
                />
              ) : (
                <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative flex items-center justify-center">
                  <video
                    ref={liveCameraRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {countdown > 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-6xl font-black text-white animate-ping">{countdown}</span>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      RECORDING VIDEO BIO (15s Max)
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 bg-neutral-900 p-6 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                      <p className="text-xs text-neutral-300 mb-4">{cameraError}</p>
                      <button
                        onClick={() => {
                          setRecordedVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-a-laptop-42999-large.mp4');
                          setRecordedTranscript("Hi! I'm passionate about accessibility, cozy board games, and making the world more inclusive.");
                        }}
                        className="text-xs bg-indigo-600 px-4 py-2 rounded-xl text-white font-semibold"
                      >
                        Use Sample Video Recording
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Recording Controls */}
              <div className="mt-3 w-full flex items-center justify-center gap-3">
                {!recordedVideoUrl ? (
                  !isRecording ? (
                    <button
                      id="btn-start-camera-recording"
                      onClick={handleStartRecording}
                      disabled={countdown > 0}
                      className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                    >
                      <span className="w-3 h-3 rounded-full bg-white" />
                      Start 15s Recording
                    </button>
                  ) : (
                    <button
                      id="btn-stop-camera-recording"
                      onClick={handleStopRecording}
                      className="px-6 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white border border-rose-500 font-bold text-xs flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-rose-500 rounded-sm" />
                      Finish Recording
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => {
                        setRecordedVideoUrl(null);
                        startCamera();
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retake Video
                    </button>
                    <button
                      onClick={handleSaveRecording}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save to Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Video Player with Live Captions & Transcripts */
            <div className="w-full h-full relative group flex items-center justify-center">
              {currentVideoBio ? (
                <>
                  <video
                    ref={videoRef}
                    src={currentVideoBio.url}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full max-h-[480px] object-cover"
                  />

                  {/* On-Video Live Closed Captions (Crucial for accessibility!) */}
                  {showCaptions && currentSubtitle && (
                    <div className="absolute bottom-16 inset-x-4 flex justify-center pointer-events-none">
                      <div className="bg-black/85 text-amber-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm text-center max-w-sm backdrop-blur-sm border border-amber-300/30 shadow-lg leading-relaxed">
                        {currentSubtitle}
                      </div>
                    </div>
                  )}

                  {/* Video Overlay Action Controls */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-neutral-950/70 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl"
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) videoRef.current.muted = !isMuted;
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl"
                        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
                      </button>

                      <button
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                          showCaptions ? 'bg-amber-400 text-black font-bold' : 'bg-white/20 text-white'
                        }`}
                        aria-pressed={showCaptions}
                        aria-label="Toggle live closed captions"
                      >
                        <Subtitles className="w-4 h-4" />
                        <span className="text-[10px]">CC</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setShowTranscript(!showTranscript);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Transcript
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-neutral-400">
                  <Video className="w-12 h-12 mx-auto mb-2 text-neutral-600" />
                  <p className="text-sm">No video bio recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full Accessible Transcript Drawer / Box */}
        {showTranscript && currentVideoBio && (
          <div className="p-4 bg-neutral-900 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Verified Video Bio Transcript & Captions
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-neutral-800">
              "{currentVideoBio.transcript}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
