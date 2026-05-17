import { useCall } from '@/contexts/CallContext';
import CallModal from '@/components/call/CallModal';

/**
 * Renders the full-screen call overlay globally so it persists even when the
 * user navigates away from ChatDetail while a call is in progress.
 * ChatDetail also renders CallModal for the outgoing flow; both share the same
 * CallContext state so they are always in sync.
 */
export default function GlobalCallModal() {
  const {
    callStatus,
    callType,
    localStream,
    remoteStream,
    activePeerName,
    activePeerPicture,
    micOn,
    cameraOn,
    callDuration,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCall();

  // Only render when a call is active and the user is NOT in the idle state.
  // ChatDetail renders its own CallModal for the outgoing/incoming states so we
  // only pick up calls that have reached 'connecting' or 'connected' here (or
  // when the user has navigated away from ChatDetail entirely).
  if (callStatus === 'idle') return null;

  return (
    <CallModal
      callStatus={callStatus}
      callType={callType}
      localStream={localStream}
      remoteStream={remoteStream}
      peerName={activePeerName}
      peerPicture={activePeerPicture}
      micOn={micOn}
      cameraOn={cameraOn}
      duration={callDuration}
      onAccept={() => void acceptCall()}
      onReject={rejectCall}
      onEnd={endCall}
      onToggleMic={toggleMic}
      onToggleCamera={toggleCamera}
    />
  );
}
