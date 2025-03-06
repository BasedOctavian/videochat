import { useState, useRef, useEffect } from 'react';
import { Box, Heading, Grid, GridItem, Spinner } from '@chakra-ui/react';
import { VideoPlayer } from '../components/VideoPlayer';
import { CallControls } from '../components/CallControls';
import { servers } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';

interface Room {
  id: string;
  status: string;
}

interface VideoCallProps {
  db: any; // Firestore instance
}

export default function VideoCall({ db }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [localId] = useState('3243244'); // Hardcoded for now
  const [remoteId] = useState('564566'); // Hardcoded for now
  const [sessionId, setSessionId] = useState('');

  const isInitialMount = useRef(true);

  // Initialize RTCPeerConnection
  useEffect(() => {
    pcRef.current = new RTCPeerConnection(servers);
    return () => {
      pcRef.current?.close();
    };
  }, []);

  // Fetch or create a room on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const fetchRooms = async () => {
        try {
          setIsLoading(true);
          const roomsCollection = collection(db, 'rooms');
          const roomsSnapshot = await getDocs(roomsCollection);

          const rooms: Room[] = roomsSnapshot.docs
            .map((doc) => {
              const data = doc.data();
              if (data.status) {
                return { id: doc.id, status: data.status } as Room;
              }
              return null;
            })
            .filter((room): room is Room => room !== null);

          const freeRoom = rooms.find((room) => room.status === 'free');

          if (freeRoom) {
            const roomRef = doc(db, 'rooms', freeRoom.id);
            await updateDoc(roomRef, { status: 'active' });
            setSessionId(freeRoom.id);
            console.log('Session ID set to:', freeRoom.id);
          } else {
            console.log('No available free rooms. Creating a new one...');
            const newRoomRef = await addDoc(roomsCollection, { status: 'active' });
            const newRoomId = newRoomRef.id;
            await updateDoc(newRoomRef, { roomId: newRoomId });
            setSessionId(newRoomId);
            console.log('Created new room with ID:', newRoomId);
          }
        } catch (error) {
          console.error('Error fetching rooms:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRooms();
    }
  }, [db]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="container.lg" mx="auto" p={4}>
      <Heading as="h1" size="xl" mb={4}>
        Session: {sessionId}
      </Heading>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={4}>
        <GridItem>
          <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.100">
            <Heading as="h2" size="md" mb={2}>
              {localId}
            </Heading>
            <VideoPlayer stream={localStream} isLocal />
          </Box>
        </GridItem>
        <GridItem>
          <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.100">
            <Heading as="h2" size="md" mb={2}>
              {remoteId}
            </Heading>
            <VideoPlayer stream={remoteStream} /> {/* Fixed to use remoteStream */}
          </Box>
        </GridItem>
      </Grid>
      <CallControls
        pc={pcRef}
        setLocalStream={setLocalStream}
        setRemoteStream={setRemoteStream}
      />
    </Box>
  );
}