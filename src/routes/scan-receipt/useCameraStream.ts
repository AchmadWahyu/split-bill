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

      try {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
        } catch (err) {
          // Rear camera not available — fall back to any camera
          if (err instanceof DOMException && err.name === 'OverconstrainedError') {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true });
          } else {
            throw err;
          }
        }

        if (!videoElement) return;
        videoElement.srcObject = localStream;

        try {
          await videoElement.play();
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          throw err;
        }

        setStream(localStream);
        const h = videoElement.videoHeight / (videoElement.videoWidth / IMG_WIDTH);
        setDimensions({ width: IMG_WIDTH, height: h });
      } catch (error) {
        const name = error instanceof DOMException ? error.name : '';
        if (name === 'NotAllowedError') {
          toast.error('Akses kamera ditolak', {
            description: 'Izinkan akses kamera di pengaturan browser, lalu coba lagi ya.',
          });
        } else if (name === 'NotFoundError') {
          toast.error('Kamera nggak ketemu', {
            description: 'Nggak ada kamera yang terdeteksi di perangkat ini.',
          });
        } else if (name === 'NotReadableError') {
          toast.error('Kamera nggak bisa dipakai', {
            description: 'Kamera mungkin lagi dipakai aplikasi lain.',
          });
        } else {
          toast.error('Ada masalah di kamera', {
            description: 'Kamera nggak bisa dinyalakan. Coba lagi sebentar ya.',
          });
          console.error('Camera error:', error);
        }
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
