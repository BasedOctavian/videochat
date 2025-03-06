import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { CallControls } from '../components/CallControls';
import { servers } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Material‑UI components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

// Material‑UI icons
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';

interface Room {
  id: string;
  status: string;
}

interface VideoCallProps {
  db: Firestore;
  user: User;
}

export default function VideoCall({ db, user }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localId] = useState(user.displayName);
  const [remoteId] = useState('remote-user-placeholder');
  const [sessionId, setSessionId] = useState('');

  // Initialize theme state from localStorage or default to 'light'
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  // Update localStorage when colorMode changes
  useEffect(() => {
    localStorage.setItem('theme', colorMode);
  }, [colorMode]);

  const toggleColorMode = () =>
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Define colors based on color mode
  const bgColor = colorMode === 'light' ? '#f7fafc' : '#1A202C';
  const headerBg = colorMode === 'light' ? '#ffffff' : '#2D3748';
  const cardBg = colorMode === 'light' ? '#ffffff' : '#4A5568';
  const textColor = colorMode === 'light' ? '#2D3748' : '#ffffff';

  const handleLogout = () => {
    // Implement your actual logout logic here
    console.log('Logout initiated');
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    pcRef.current = new RTCPeerConnection(servers);
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream, remoteStream]);

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
            await updateDoc(roomRef, { status: 'active', userId: user.uid });
            setSessionId(freeRoom.id);
          } else {
            const newRoomRef = await addDoc(roomsCollection, {
              status: 'active',
              userId: user.uid,
            });
            const newRoomId = newRoomRef.id;
            await updateDoc(newRoomRef, { roomId: newRoomId });
            setSessionId(newRoomId);
          }
        } catch (error) {
          console.error('Error fetching rooms:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRooms();
    }
    console.log('User ID:', user.uid);
  }, [db, user.uid]);

  if (isLoading) {
    return (
      <Container
        sx={{
          minHeight: '100vh',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color={textColor}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: bgColor, color: textColor }}>
      {/* Header */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: headerBg,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          height: '60px',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ color: '#3182ce' }}>
            Outof10
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#3182ce',
                borderRadius: '16px',
                px: 1,
                py: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff' }}>
                Session: {sessionId}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User Avatar'}
                sx={{ width: 32, height: 32 }}
              />
              <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle dark mode">
                {colorMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
              <IconButton onClick={handleLogout} color="inherit" aria-label="Logout">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Local Video */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: cardBg,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {localId}
                </Typography>
                <Chip label="You" color="success" size="small" />
              </Box>
              <VideoPlayer stream={localStream} isLocal />
            </Paper>
          </Grid>

          {/* Remote Video */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: cardBg,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {remoteId}
                </Typography>
                {remoteStream && <Chip label="Connected" color="error" size="small" />}
              </Box>
              <VideoPlayer stream={remoteStream} />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Call Controls */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          p: 2,
          maxWidth: 600,
          width: '100%',
        }}
      >
        <CallControls
          pc={pcRef}
          setLocalStream={setLocalStream}
          setRemoteStream={setRemoteStream}
          colorMode={colorMode}
        />
      </Paper>
    </Box>
  );
}