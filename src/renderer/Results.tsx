/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import { List } from 'react-virtualized';

import './App.css';
import React from 'react';

import {
  Box,
  Card,
  Button,
  Modal,
  Grid,
  Typography,
  TextField,
} from '@mui/material';
import TopBar from './components/TopBar';
import MessageThread from './components/MessageThread';
// import { Box, Card } from '@chakra-ui/react';

export default function Results() {
  const navigation = useNavigate();
  const [problemMessages, setProblemMessages] = React.useState([]);
  const [desktopPath, setDesktopPath] = React.useState('');
  const [threadPath, setThreadPath] = React.useState('');
  const [threadChatName, setThreadChatName] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAddWords, setShowAddWords] = React.useState(false);
  const [showOmitWords, setShowOmitWords] = React.useState(false);
  const [searchMessages, setSearchMessages] = React.useState([]);
  const [searchOn, setSearchOn] = React.useState(false);

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

    window.electron.ipcRenderer.on('search-results', (messages) => {
      setSearchMessages(messages);
    });

    window.electron.ipcRenderer.on('problemMessages', (data) => {
      setProblemMessages(data.messages);
      setDesktopPath(data.desktopPath);
    });
  }, []);

  const reset = () => {
    window.electron.ipcRenderer.sendMessage('reset');
  };

  const startSearch = () => {
    setSearchOn(true);
    window.electron.ipcRenderer.sendMessage('search-texts', searchTerm);
  };

  const filterUserThread = (thread_path: string) => {
    setThreadPath(thread_path);
  };

  // m.context
  // .filter((x) => x.content)
  // .map((i) => i.content.toLowerCase().indexOf(searchTerm) > -1)
  // .contains(true)

  const contextContainsPhrase = (context, term) => {
    const matchingContext = context.filter(
      (m) =>
        m.content &&
        m.content.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    );
    return matchingContext.length > 0;
  };

  React.useEffect(() => {
    setSearchMessages([]);
    setSearchOn(false);
  }, [searchTerm]);

  const getProblemFiltered = () => {
    if (searchOn) {
      return problemMessages.filter(
        (m) =>
          (m.content &&
            m.content.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) ||
          contextContainsPhrase(m.context, searchTerm)
      );
    }
    if (threadPath) {
      return problemMessages.filter((m) => m.thread_path === threadPath);
    }
    return problemMessages;
  };

  const getSearchFilter = () => {};
  const clearThreadPath = () => {
    setThreadChatName('');
    setThreadPath('');
  };

  const resolveMessage = (timestamp: number) => {
    window.electron.ipcRenderer.sendMessage('resolveMessage', timestamp);
    const copyMessages = [...problemMessages];
    setProblemMessages(
      copyMessages.filter((m) => m.timestamp_ms !== timestamp)
    );
  };

  function rowRenderer({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) {
    return (
      <div key={key} style={style}>
        <MessageThread
          filterUserThread={filterUserThread}
          message={getProblemFiltered().concat(searchMessages)[index]}
          resolveMessage={resolveMessage}
          desktopPath={desktopPath}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#F6F6F6',
        }}
      >
        <div
          style={{
            width: 680,
          }}
        >
          <TopBar
            startSearch={startSearch}
            setSearchTerm={setSearchTerm}
            searchTerm={searchTerm}
            reset={reset}
            setShowAddWords={setShowAddWords}
            setShowOmitWords={setShowOmitWords}
            problemMessages={problemMessages}
          />
          {searchOn && (
            <Button
              onClick={() => setSearchTerm('')}
              style={{ backgroundColor: 'black', color: 'white' }}
            >
              Clear search "{searchTerm}"
            </Button>
          )}
          <br />
          {threadPath && (
            <p
              onClick={() => setThreadPath('')}
              style={{ cursor: 'pointer', marginTop: 20, fontWeight: 'bold' }}
            >
              Back
            </p>
          )}
          {/* {searchOn &&
            getSearchFilter().map((message) => (
              <MessageThread
                filterUserThread={filterUserThread}
                message={message}
                resolveMessage={resolveMessage}
                desktopPath={desktopPath}
              />
            ))} */}
          {/* {getProblemFiltered().map((message, index) => (
            <MessageThread
              filterUserThread={filterUserThread}
              message={message}
              resolveMessage={resolveMessage}
              desktopPath={desktopPath}
            />
          ))}
          
          {searchMessages.map((message, index) => (
            <MessageThread
              filterUserThread={filterUserThread}
              isSearch
              message={message}
              resolveMessage={resolveMessage}
              desktopPath={desktopPath}
            />
          ))} */}

          <List
            width={700}
            height={600}
            rowHeight={600}
            rowCount={getProblemFiltered().concat(searchMessages).length}
            rowRenderer={rowRenderer}
          />
        </div>
      </div>
      <Modal
        open={showAddWords}
        onClose={() => setShowAddWords(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style.modalStyle}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            style={{ marginBottom: 15 }}
          >
            Add Words to Blocklist
          </Typography>
          <div
            style={{
              display: 'flex',
              height: 50,
              width: '100%',
              backgroundColor: 'white',
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              border: '.25px solid black',
            }}
          >
            <div style={{ width: '100%', height: 50, padding: 10 }}>
              <p style={{ marginBottom: 0, color: 'gray' }}>Add a word</p>
            </div>
            <div
              style={{
                display: 'flex',
                width: 130,
                height: 50,
                marginLeft: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                borderRadius: 10,
                borderColor: 'black',
                borderWidth: 1,
              }}
            >
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
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            style={{ marginBottom: 15 }}
          >
            Add Words to Omit
          </Typography>
          <div
            style={{
              display: 'flex',
              height: 50,
              width: '100%',
              backgroundColor: 'white',
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              border: '.25px solid black',
            }}
          >
            <div style={{ width: '100%', height: 50, padding: 10 }}>
              <p style={{ marginBottom: 0, color: 'gray' }}>Add a word</p>
            </div>
            <div
              style={{
                display: 'flex',
                width: 130,
                height: 50,
                marginLeft: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                borderRadius: 10,
                borderColor: 'black',
                borderWidth: 1,
              }}
            >
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
  },
};
