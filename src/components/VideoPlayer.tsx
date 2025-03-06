import { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

type VideoPlayerProps = {
  stream: MediaStream | null;
  isLocal?: boolean;
};

export const VideoPlayer = ({ stream, isLocal = false }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (isLocal) {
        videoRef.current.muted = true;
      }
    }
  }, [stream, isLocal]);

  return (
    <Box
      component="video"
      ref={videoRef}
      sx={{
        width: '100%',
        height: 'auto',
        borderRadius: 2,
      }}
      autoPlay
      playsInline
    />
  );
};
