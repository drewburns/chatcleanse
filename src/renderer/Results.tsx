/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import './App.css';
import React from 'react';
import { Button, Card, Grid, TextField } from '@mui/material';

export default function Results() {
  const navigation = useNavigate();
  const [problemMessages, setProblemMessages] = React.useState([]);
  const [desktopPath, setDesktopPath] = React.useState('');
  const [threadPath, setThreadPath] = React.useState('');
  const [threadChatName, setThreadChatName] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
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

  function unique(array, propertyName) {
    return array.filter(
      (e, i) =>
        array.findIndex((a) => a[propertyName] === e[propertyName]) === i
    );
  }

  const orderAndCleanMessages = (message) => {
    return unique(message.context.concat(message), 'timestamp_ms').sort(
      (a, b) => a.timestamp_ms - b.timestamp_ms
    );
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

  // m.context
  // .filter((x) => x.content)
  // .map((i) => i.content.toLowerCase().indexOf(searchTerm) > -1)
  // .contains(true)

  const getProblemFiltered = () => {
    if (searchTerm.length > 3) {
      return problemMessages.filter(
        (m) => m.content && m.content.toLowerCase().indexOf(searchTerm) > -1
      );
    }
    if (threadPath) {
      return problemMessages.filter((m) => m.thread_path === threadPath);
    }
    return problemMessages;
  };
  const clearThreadPath = () => {
    setThreadChatName('');
    setThreadPath('');
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#F6F6F6',
        }}
      >
        <Grid item xs={2} />
        <div
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
              paddingBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p
                  style={{ marginBottom: 0, fontSize: 20, fontWeight: 'bold' }}
                >
                  {problemMessages.length} issues found
                </p>
                <p style={{ marginBottom: 10, marginTop: 10 }}>Instagram</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    width: 95,
                    height: 40,
                    marginLeft: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid black',
                    borderRadius: 5,
                  }}
                >
                  <p>Add Words</p>
                </div>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    width: 95,
                    height: 40,
                    marginLeft: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid black',
                    borderRadius: 5,
                  }}
                >
                  <p>Omit Words</p>
                </div>
                <div
                  onClick={() => reset()}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    width: 95,
                    height: 40,
                    marginLeft: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid black',
                    borderRadius: 5,
                  }}
                >
                  <p>New Scan</p>
                </div>
              </div>
            </div>

            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="outlined-basic"
              label="Search for a text"
              variant="outlined"
            />
          </div>
          <br />
          {threadPath && (
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                marginTop: 20,
                height: 43,
                width: 143,
                marginRight: 20,
                backgroundColor: 'black',
                color: 'white',
                borderRadius: 3,
                marginBottom: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setThreadPath('')}
            >
              Back
            </div>
          )}
          {getProblemFiltered().map((message) => (
            <Card
              style={{
                marginTop: 10,
                marginRight: 3,
                marginLeft: 3,
                paddingLeft: 20,
                paddingBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingRight: 20,
                }}
              >
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => filterUserThread(message.thread_path)}
                >
                  <p
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 0,
                      fontSize: 19,
                    }}
                  >
                    {decodeURIComponent(escape(message.title))}
                  </p>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: '#999999',
                    }}
                  >
                    See all from sender
                  </p>
                </div>

                <p
                  style={{
                    paddingTop: 8,
                  }}
                >
                  {new Date(message.timestamp_ms).toLocaleDateString()}
                </p>
              </div>

              {orderAndCleanMessages(message).map((cm) => (
                <Grid container style={{ paddingRight: 10 }}>
                  {cm.sender_name === message.username && (
                    <Grid item xs={6} md={5} />
                  )}
                  <div
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
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  float: 'right',
                  marginTop: 20,
                  height: 43,
                  width: 143,
                  marginRight: 20,
                  backgroundColor: 'black',
                  color: 'white',
                  borderRadius: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => resolveMessage(message.timestamp_ms)}
              >
                Mark Resolved
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
