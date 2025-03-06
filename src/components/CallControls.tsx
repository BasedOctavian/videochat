import { useState, useRef } from 'react';
import { collection, doc, getDoc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase/init';
import { servers } from '../firebase/config';
import { Box, Button, Input, HStack } from '@chakra-ui/react';

type CallControlsProps = {
  pc: React.MutableRefObject<RTCPeerConnection | null>;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
};

export const CallControls = ({ pc, setLocalStream, setRemoteStream }: CallControlsProps) => {
  const [callId, setCallId] = useState('');
  const [webcamStarted, setWebcamStarted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamStarted(true);
      localStreamRef.current = stream;
      setLocalStream(stream);

      stream.getTracks().forEach(track => {
        pc.current?.addTrack(track, stream);
      });

      pc.current!.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStreamRef.current.addTrack(track);
        });
        setRemoteStream(remoteStreamRef.current);
      };
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopWebcam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (pc.current) {
      pc.current.close();
      pc.current = new RTCPeerConnection(servers);
    }

    setRemoteStream(null);
    setWebcamStarted(false);
  };

  const createCall = async () => {
    const callDoc = doc(collection(firestore, 'calls'));
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    setCallId(callDoc.id);

    pc.current!.onicecandidate = (event) => {
      event.candidate && setDoc(doc(offerCandidates), event.candidate.toJSON());
    };

    const offerDescription = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offerDescription);

    await setDoc(callDoc, {
      offer: {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      },
    });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.current?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current!.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  };

  const answerCall = async () => {
    const callDoc = doc(firestore, 'calls', callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.current!.onicecandidate = (event) => {
      event.candidate && setDoc(doc(answerCandidates), event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data()!;
    const offerDescription = callData.offer;
    await pc.current!.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.current!.createAnswer();
    await pc.current!.setLocalDescription(answerDescription);

    await updateDoc(callDoc, {
      answer: {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      },
    });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  };

  return (
    <Box p={4} bg="gray.100" rounded="lg" display="flex" flexDirection="column" gap={4}>
      {!webcamStarted ? (
        <Button colorScheme="blue" onClick={startWebcam}>
          Start Webcam
        </Button>
      ) : (
        <HStack gap={4}>
          <Input
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            placeholder="Call ID"
          />
          <Button colorScheme="orange" onClick={createCall}>
            Create Call
          </Button>
          <Button colorScheme="green" onClick={answerCall}>
            Answer Call
          </Button>
          <Button colorScheme="red" onClick={stopWebcam}>
            Stop Webcam
          </Button>
        </HStack>
      )}
    </Box>
  );
};
