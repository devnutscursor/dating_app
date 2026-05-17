import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiUploadFile } from '@/lib/api';
import {
  createVerificationChallenge,
  fetchMyVerification,
  submitVerificationVideo,
} from '@/lib/verification';

type Props = {
  area: 'man' | 'woman';
};

export default function VideoVerificationPage({ area }: Props) {
  const { user, refreshUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [challengeNumbers, setChallengeNumbers] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyVerification();
      if (data.isVerified || data.status === 'approved') {
        setStatus('approved');
        return;
      }
      if (data.status === 'pending' && data.request?.videoUrl) {
        setStatus('pending');
        setChallengeNumbers(data.request.challengeNumbers ?? '');
        setRequestId(data.request.id);
        setPreviewUrl(data.request.videoUrl);
        return;
      }
      if (data.status === 'pending' && data.request) {
        setStatus('none');
        setChallengeNumbers(data.request.challengeNumbers ?? '');
        setRequestId(data.request.id);
        return;
      }
      setStatus(data.status === 'rejected' ? 'rejected' : 'none');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load verification status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    return () => stopCamera();
  }, [loadStatus, stopCamera]);

  const startChallenge = async () => {
    setBusy(true);
    try {
      const data = await createVerificationChallenge();
      setChallengeNumbers(data.challengeNumbers);
      setRequestId(data.requestId);
      setStatus('none');
      setRecordedBlob(null);
      setPreviewUrl(null);
      toast.success('Read these numbers aloud while recording');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start verification');
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      toast.error('Camera and microphone access are required for verification');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      void startCamera();
      return;
    }
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    };
    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const submitVideo = async () => {
    if (!recordedBlob || !requestId) return;
    setBusy(true);
    try {
      const file = new File([recordedBlob], 'verification.webm', { type: 'video/webm' });
      const { url } = await apiUploadFile<{ url: string }>('/uploads/video', file);
      await submitVerificationVideo({ videoUrl: url, requestId });
      await refreshUser();
      setStatus('pending');
      setPreviewUrl(url);
      toast.success('Verification video submitted for review');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not submit verification');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (status === 'approved' || user?.isVerified) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-8 text-center shadow-sm">
        <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re verified</h1>
        <p className="text-gray-500">Your profile shows a verified badge to other members.</p>
        <Button asChild variant="outline">
          <Link to={`/${area}/profile`}>Back to profile</Link>
        </Button>
      </div>
    );
  }

  if (status === 'pending' && previewUrl) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Verification in review</h1>
        <p className="text-gray-500">
          A moderator is reviewing your video. You&apos;ll get a notification when it&apos;s approved or if you need to try again.
        </p>
        <video src={previewUrl} controls className="w-full rounded-xl bg-gray-900" />
        <Button asChild variant="outline" className="w-full">
          <Link to={`/${area}/profile`}>Back to profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video verification</h1>
        <p className="text-gray-500">
          Record a short selfie video saying the numbers below. This helps moderators confirm you match your profile photo.
        </p>
      </div>

      {status === 'rejected' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">
            Your last verification was not approved. Record a new video with the numbers clearly spoken in order.
          </p>
        </div>
      )}

      {!challengeNumbers ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-gray-600">
            We&apos;ll show you five random digits. Say them aloud while your face is visible on camera.
          </p>
          <Button onClick={() => void startChallenge()} disabled={busy} className="w-full bg-green-500 hover:bg-green-600">
            {busy ? 'Starting…' : 'Get my numbers'}
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/80">Say these numbers in order</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-[0.25em] text-blue-950">{challengeNumbers}</p>
          </div>

          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            {!previewUrl ? (
              <>
                <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-900">
                  <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button type="button" variant="secondary" onClick={() => void startCamera()}>
                        <Video className="mr-2 h-4 w-4" />
                        Enable camera
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {!recording ? (
                    <Button
                      type="button"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      disabled={!cameraReady}
                      onClick={startRecording}
                    >
                      Start recording
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" className="flex-1" onClick={stopRecording}>
                      Stop recording
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <video src={previewUrl} controls className="w-full rounded-xl bg-gray-900" />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRecordedBlob(null);
                      setPreviewUrl(null);
                      void startCamera();
                    }}
                  >
                    Re-record
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
                    disabled={busy}
                    onClick={() => void submitVideo()}
                  >
                    <Upload className="h-4 w-4" />
                    {busy ? 'Uploading…' : 'Submit for review'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <Button asChild variant="ghost" className="w-full">
        <Link to={`/${area}/profile`}>Cancel</Link>
      </Button>
    </div>
  );
}
