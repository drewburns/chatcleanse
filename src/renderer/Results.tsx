/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import './App.css';
import React from 'react';
import { Button, Card, Grid } from '@mui/material';

export default function Results() {
  const navigation = useNavigate();
  const [problemMessages, setProblemMessages] = React.useState([]);
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
      setProblemMessages(data);
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
            src={`file:///Users/andrewburns/Desktop/chatcleanse_data/${photo.uri}`}
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
              src={`file:///Users/andrewburns/Desktop/chatcleanse_data/${audio.uri}`}
              type="audio/mp4"
            />
          </audio>
          //   <audio
          //     controls
          //     src={`file://Users/andrewburns/Desktop/chatcleanse_data/${audio.uri}`}
          //   />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Grid container>
        <Grid item xs={2} />
        <Grid item xs={8}>
          <h3>Results</h3>
          <h3>{problemMessages.length} issues found</h3>
          {problemMessages.map((message) => (
            <Card style={{ marginTop: 20 }}>
              <h4>{message.title}</h4>
              <p>{new Date(message.timestamp_ms).toLocaleDateString()}</p>
              {orderAndCleanMessages(message).map((cm) => (
                <Grid container>
                  {cm.sender_name === message.username && (
                    <Grid item xs={6} md={5} />
                  )}
                  <Grid
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
                        cm.sender_name === message.username ? 'right' : 'left',
                      paddingRight: 20,
                      paddingLeft: 20,
                      marginTop: 10,
                      borderRadius: 20,
                      marginBottom: 10,
                    }}
                  >
                    <p>{cm.content}</p>
                    {cm.photos && displayImages(cm.photos)}
                    {cm.audio_files && displayAudio(cm.audio_files)}
                  </Grid>
                  {cm.timestamp_ms === message.timestamp_ms && (
                    <div className="problemDot" />
                  )}
                </Grid>
              ))}
              <Button
                style={{ float: 'right', marginTop: 20 }}
                variant="contained"
                onClick={() => resolveMessage(message.timestamp_ms)}
              >
                Mark resolved
              </Button>
            </Card>
          ))}
          <Button onClick={() => reset()}>Restart</Button>
        </Grid>
      </Grid>
    </div>
  );
}
