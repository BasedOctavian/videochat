import { useState, useRef, useEffect } from 'react';
import { ChakraProvider, Box, Heading, Grid, GridItem, Spinner, defaultSystem } from '@chakra-ui/react';
import { VideoPlayer } from './components/VideoPlayer';
import { CallControls } from './components/CallControls';
import { firebaseConfig, servers } from './firebase/config';
import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, DocumentData, updateDoc, doc, addDoc } from 'firebase/firestore';

interface Room {
  id: string;
  status: string;
}

export default function App() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [localId, setLocalId] = useState('3243244');
  const [remoteId, setRemoteId] = useState('564566');
  const [sessionId, setSessionId] = useState(''); // Empty session ID initially

  const isInitialMount = useRef(true); // Ref to track if it's the initial mount

  // Initialize RTCPeerConnection
  useEffect(() => {
    pcRef.current = new RTCPeerConnection(servers);
    return () => {
      pcRef.current?.close();
    };
  }, []);

  // Fetch or create a room only once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark as run immediately
      const fetchRooms = async () => {
        try {
          setIsLoading(true);
          const app = initializeApp(firebaseConfig);
          const db = getFirestore(app);

          const roomsCollection = collection(db, "rooms");
          const roomsSnapshot = await getDocs(roomsCollection);

          const rooms: Room[] = roomsSnapshot.docs
            .map((doc) => {
              const data = doc.data() as DocumentData;
              if (data.status) {
                return { id: doc.id, status: data.status } as Room;
              }
              return null;
            })
            .filter((room): room is Room => room !== null);

          const freeRoom = rooms.find((room) => room.status === "free");

          if (freeRoom) {
            // Use an existing free room and set it to active
            const roomRef = doc(db, "rooms", freeRoom.id);
            await updateDoc(roomRef, { status: "active" });
            setSessionId(freeRoom.id);
            console.log("Session ID set to:", freeRoom.id);
          } else {
            // Create a new room and set it to active
            console.log("No available free rooms. Creating a new one...");
            const newRoomRef = await addDoc(roomsCollection, { status: "active" });
            const newRoomId = newRoomRef.id;
            await updateDoc(newRoomRef, { roomId: newRoomId });
            setSessionId(newRoomId);
            console.log("Created new room with ID:", newRoomId);
          }
        } catch (error) {
          console.error("Error fetching rooms:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRooms();
    }
  }, []); // Empty dependency array ensures it runs only on mount

  // Loading state UI
  if (isLoading) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
          <Spinner size="xl" />
        </Box>
      </ChakraProvider>
    );
  }

  // Main UI
  return (
    <ChakraProvider value={defaultSystem}>
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
              <VideoPlayer stream={localStream} />
            </Box>
          </GridItem>
        </Grid>

        <CallControls 
          pc={pcRef}
          setLocalStream={setLocalStream}
          setRemoteStream={setRemoteStream}
        />
      </Box>
    </ChakraProvider>
  );
}