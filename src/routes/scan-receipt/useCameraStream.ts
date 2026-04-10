import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const IMG_WIDTH = 360;

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [dimensions, setDimensions] = useState({ width: IMG_WIDTH, height: 0 });

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const videoElement = videoRef.current;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('Camera not supported', {
          description:
            'navigator.mediaDevices.getUserMedia() is not supported on this device or browser.',
        });
        return;
      }

      localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (!videoElement) return;

      videoElement.srcObject = localStream;

      try {
        await videoElement.play();
        setStream(localStream);

        const h = videoElement.videoHeight / (videoElement.videoWidth / IMG_WIDTH);
        setDimensions({ width: IMG_WIDTH, height: h });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error playing video:', error);
      }
    }

    start();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, []);

  return { videoRef, stream, dimensions };
}
