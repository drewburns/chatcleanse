/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import './App.css';
import React from 'react';
import { Box, Button, Card, Grid, Modal, Typography } from '@mui/material';

export default function Results() {
  const navigation = useNavigate();
  const [problemMessages, setProblemMessages] = React.useState([]);
  const [desktopPath, setDesktopPath] = React.useState('');
  const [threadPath, setThreadPath] = React.useState('');
  const [showAddWords, setShowAddWords] = React.useState(false);
  const [showOmitWords, setShowOmitWords] = React.useState(false);

  React.useEffect(() => {
    window.electron.ipcRenderer.sendMessage('getProblemMessages');
    window.electron.ipcRenderer.on('go-to-page', (page) => {
      console.log('to to page', page);
      if (!page) {
        navigation('/');
      } else {
        navigation(page);
      }
    });
    window.electron.ipcRenderer.on('problemMessages', (data) => {
      setProblemMessages(data.messages);
      setDesktopPath(data.desktopPath);
    });
  }, []);

  const reset = () => {
    window.electron.ipcRenderer.sendMessage('reset');
  };

  const resolveMessage = (timestamp: number) => {
    window.electron.ipcRenderer.sendMessage('resolveMessage', timestamp);
    const copyMessages = [...problemMessages];
    setProblemMessages(
      copyMessages.filter((m) => m.timestamp_ms !== timestamp)
    );
  };

  const orderAndCleanMessages = (message) => {
    return message.context.sort((a, b) => a.timestamp_ms - b.timestamp_ms);
  };

  const displayImages = (photos) => {
    return (
      <div>
        {photos.map((photo) => (
          <img
            style={{ height: 150 }}
            src={`file://${desktopPath}/chatcleanse_data/${photo.uri}`}
          />
        ))}
      </div>
    );
  };

  const displayAudio = (audioFiles) => {
    return (
      <div>
        {audioFiles.map((audio) => (
          <audio controls>
            <source
              src={`file://${desktopPath}/chatcleanse_data/${audio.uri}`}
              type="audio/mp4"
            />
          </audio>
        ))}
      </div>
    );
  };

  const filterUserThread = (thread_path: string) => {
    setThreadPath(thread_path);
  };

  const getProblemFiltered = () => {
    if (threadPath) {
      return problemMessages.filter((m) => m.thread_path === threadPath);
    }
    return problemMessages;
  };

  return (
    <div>
      <div
        container
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#F6F6F6'

        }}
      >
        <Grid item xs={2} />
        <div
          item
          xs={8}
          style={{
            width: 680,
          }}
        >
          <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            backgroundColor: '#F6F6F6',
            paddingBottom: 20
          }}>
            <div style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <div>
              <p style={{marginBottom: 0, fontSize: 20, fontWeight: 'bold'}}>{problemMessages.length} issues found</p>
              <p style={{marginBottom: 10, marginTop: 10}}>Instagram</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row'}}>
              <div style={{ cursor: 'pointer', display: 'flex', width: 95, height: 40, marginLeft: 10, alignItems: 'center', justifyContent: 'center', border: '1px solid black', borderRadius: 5}}
                   onClick={() => setShowAddWords(true)}>
              <p>Add Words</p>
              </div>
              <div style={{ cursor: 'pointer', display: 'flex', width: 95, height: 40, marginLeft: 10, alignItems: 'center', justifyContent: 'center', border: '1px solid black', borderRadius: 5}}
                   onClick={() => setShowOmitWords(true)}>
                <p>Omit Words</p>
              </div>
              <div onClick={() => reset()}
                   style={{ cursor: 'pointer', display: 'flex', width: 95, height: 40, marginLeft: 10, alignItems: 'center', justifyContent: 'center', border: '1px solid black', borderRadius: 5}}>
              <p>New Scan</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', height: 50, width: '100%', backgroundColor: 'white', borderRadius: 10, flexDirection: 'row', alignItems: 'center', border: '.25px solid black', }}>
            <div style={{ width: '100%', height: 50, padding: 10}}>
              <p style={{ marginBottom: 0, color: 'gray'}}>Search your messages for a phrase</p>
            </div>
            <div style={{ display: 'flex', width: 130, height: 50, marginLeft: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', borderRadius: 10, borderColor: 'black', borderWidth: 1}}>
              <p style={{ color: 'white' }}>Search</p>
            </div>
          </div>
          </div>
          {/* <Button onClick={() => reset()}>Upload new (restart)</Button> */}
          <br />
          {threadPath && (
            <p onClick={() => setThreadPath('')} style={{cursor: 'pointer', marginTop: -10, fontWeight: 'bold'}}>
              Back
            </p>
          )}
          {getProblemFiltered().map((message) => (
            <Card style={{ marginTop: 10, marginRight: 3, marginLeft: 3,  paddingLeft: 20, paddingBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 20}}>
                <div style={{cursor: 'pointer'}} onClick={() => filterUserThread(message.thread_path)}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 0,
                      fontSize: 19
                  }}
                  >
                    {decodeURIComponent(escape(message.title))}
                  </p>
                  <p style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#999999'
                  }}>See all from sender</p>
                </div>

              <p style={{
                paddingTop:8
              }}>
                {new Date(message.timestamp_ms).toLocaleDateString()}
              </p>
              </div>

              {orderAndCleanMessages(message).map((cm) => (
                <Grid container style={{ paddingRight: 10 }}>
                  {cm.sender_name === message.username && (
                    <Grid item xs={6} md={5} />
                  )}
                  <div
                    item
                    xs={6}
                    md={5}
                    style={{
                      backgroundColor:
                        cm.sender_name === message.username
                          ? '#0A82F5'
                          : '#D2D2D2',
                      color:
                        cm.sender_name === message.username ? 'white' : 'black',
                      textAlign:
                        cm.sender_name === message.username ? 'left' : 'left',
                      paddingRight: 15,
                      paddingLeft: 15,
                      marginLeft:
                        cm.sender_name === message.username ? 'auto' : 0,
                      marginTop: 10,
                      marginRight:
                        cm.sender_name === message.username ? 10 : null,
                      marginRight:
                        cm.timestamp_ms !== message.timestamp_ms &&
                        cm.sender_name === message.username &&
                        30,
                      borderRadius: 20,
                      marginBottom: 10,
                      maxWidth: 300,
                    }}
                  >
                    {cm.content && (
                      <p>{decodeURIComponent(escape(cm.content))}</p>
                    )}
                    {cm.photos && displayImages(cm.photos)}
                    {cm.audio_files && displayAudio(cm.audio_files)}
                  </div>
                  {cm.timestamp_ms === message.timestamp_ms && (
                    <div className="problemDot" />
                  )}
                </Grid>
              ))}
              <div
                style={{ cursor: 'pointer', display: 'flex', float: 'right', marginTop: 20, height: 43, width: 143, marginRight: 20, backgroundColor: 'black', color: 'white', borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}
                variant="contained"
                onClick={() => resolveMessage(message.timestamp_ms)}
              >
                Mark Resolved
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Modal
        open={showAddWords}
        onClose={() => setShowAddWords(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" style={{marginBottom: 15}}>
            Add Words to Blocklist
          </Typography>
          <div style={{ display: 'flex', height: 50, width: '100%', backgroundColor: 'white', borderRadius: 10, flexDirection: 'row', alignItems: 'center', border: '.25px solid black', }}>
            <div style={{ width: '100%', height: 50, padding: 10}}>
              <p style={{ marginBottom: 0, color: 'gray'}}>Add a word</p>
            </div>
            <div style={{ display: 'flex', width: 130, height: 50, marginLeft: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', borderRadius: 10, borderColor: 'black', borderWidth: 1}}>
              <p style={{ color: 'white' }}>Add</p>
            </div>
          </div>
          <p>added words show here</p>
        </Box>
      </Modal>
      <Modal
        open={showOmitWords}
        onClose={() => setShowOmitWords(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" style={{marginBottom: 15}}>
            Add Words to Omit
          </Typography>
          <div style={{ display: 'flex', height: 50, width: '100%', backgroundColor: 'white', borderRadius: 10, flexDirection: 'row', alignItems: 'center', border: '.25px solid black', }}>
            <div style={{ width: '100%', height: 50, padding: 10}}>
              <p style={{ marginBottom: 0, color: 'gray'}}>Add a word</p>
            </div>
            <div style={{ display: 'flex', width: 130, height: 50, marginLeft: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black', borderRadius: 10, borderColor: 'black', borderWidth: 1}}>
              <p style={{ color: 'white' }}>Add</p>
            </div>
          </div>
          <div>
            <p>added words show here</p>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

const style = {
  modalStyle: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  }
};
