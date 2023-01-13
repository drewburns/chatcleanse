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
  const [desktopPath, setDesktopPath] = React.useState('');
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

  return (
    <div>
      <div
        container
        style={{
          display:"flex",
          justifyContent: 'center',
        }}
      >
        <Grid item xs={2} />
        <div
          item
          xs={8}
          style={{
            width: 680
          }}
        >

          <h3>Results</h3>
          <h3>{problemMessages.length} issues found</h3>
          <Button onClick={() => reset()}>Upload new (restart)</Button>
          {problemMessages.map((message) => (
            <Card style={{ marginTop: 20, paddingLeft: 20, paddingBottom: 20 }}>
              <h4>{message.title}</h4>
              <p>{new Date(message.timestamp_ms).toLocaleDateString()}</p>
              {orderAndCleanMessages(message).map((cm) => (
                <Grid container
                style={{ paddingRight: 10}}>
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
                        cm.sender_name === message.username ? 'right' : 'left',
                      paddingRight: 15,
                      paddingLeft: 15,
                      marginLeft:
                        cm.sender_name === message.username ? 'auto' : 0,
                      marginTop: 10,
                      marginRight:
                        cm.sender_name === message.username ? 10 : null,
                      marginRight:
                        cm.timestamp_ms !== message.timestamp_ms && cm.sender_name === message.username && 30,
                      borderRadius: 20,
                      marginBottom: 10,
                      maxWidth: 300,
                    }}
                  >
                    <p>{cm.content}</p>
                    {cm.photos && displayImages(cm.photos)}
                    {cm.audio_files && displayAudio(cm.audio_files)}
                  </div>
                  {cm.timestamp_ms === message.timestamp_ms && (
                    <div className="problemDot" />
                  )}
                </Grid>
              ))}
              <Button
                style={{ float: 'right', marginTop: 20, marginRight: 20 }}
                variant="contained"
                onClick={() => resolveMessage(message.timestamp_ms)}
              >
                Mark resolved
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
