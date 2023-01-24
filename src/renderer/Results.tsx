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
import WordsModal from './components/WordsModal';
import Loading from './components/Loading';
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
  const [showMarkResolve, setShowMarkResolve] = React.useState(false);
  const [onboardingShown, setOnboardingShown] = React.useState(false);
  const [searchMessages, setSearchMessages] = React.useState([]);
  const [searchOn, setSearchOn] = React.useState(false);
  const [addWords, setAddWords] = React.useState([]);
  const [omitWords, setOmitWords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    window.electron.ipcRenderer.sendMessage('getProblemMessages');
    window.electron.ipcRenderer.sendMessage('get-add-words');
    window.electron.ipcRenderer.sendMessage('get-omit-words');
    window.electron.ipcRenderer.on('go-to-page', (page) => {
      if (!page) {
        navigation('/');
      } else {
        navigation(page);
      }
    });

    window.electron.ipcRenderer.on('add-words', (arr) => {
      setAddWords(arr);
    });

    window.electron.ipcRenderer.on('omit-words', (arr) => {
      setOmitWords(arr);
    });

    window.electron.ipcRenderer.on('search-results', (messages) => {
      setSearchMessages(messages);
    });

    window.electron.ipcRenderer.on('problemMessages', (data) => {
      setProblemMessages(data.messages);
      setDesktopPath(data.desktopPath);
      setLoading(false);
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

  const displayModalOnboarding = () => {
    !onboardingShown && setShowMarkResolve(true);
    setOnboardingShown(true);
  };

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

  React.useEffect(() => {
    window.electron.ipcRenderer.sendMessage('get-add-words');
    window.electron.ipcRenderer.sendMessage('get-omit-words');
  }, [showAddWords, showOmitWords]);

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

  const setWords = (type: string, newWord: string) => {
    if (type === 'Omit') {
      const newOmit = omitWords.concat(newWord);
      setOmitWords(newOmit);
      window.electron.ipcRenderer.sendMessage('set-omit-words', newOmit);
      window.electron.ipcRenderer.sendMessage('getProblemMessages');
      return;
    }
    const newAdd = addWords.concat(newWord);
    setAddWords(newAdd);
  };

  const deleteWord = (type: string, deleteWord: string) => {
    if (type === 'Omit') {
      const newOmit = omitWords.filter((x) => x !== deleteWord);
      setOmitWords(newOmit);
      return;
    }
    const newAdd = addWords.filter((x) => x !== deleteWord);
    setAddWords(newAdd);
  };

  const confirmChanges = (type: string) => {
    if (type === 'Omit') {
      window.electron.ipcRenderer.sendMessage('set-omit-words', omitWords);
      window.electron.ipcRenderer.sendMessage('getProblemMessages');
      return;
    }
    window.electron.ipcRenderer.sendMessage('set-add-words', addWords);
    window.electron.ipcRenderer.sendMessage('getProblemMessages');
    setLoading(true);
    setShowAddWords(false);
    setShowOmitWords(false);
  };

  const resolveMessage = (timestamp: number) => {
    window.electron.ipcRenderer.sendMessage('resolveMessage', timestamp);
    const copyMessages = [...problemMessages];
    setProblemMessages(
      copyMessages.filter((m) => m.timestamp_ms !== timestamp)
    );
  };

  const getRowHeight = ({ index }) => {
    return 1000;
  };

  function rowRenderer({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
  }) {
    return (
      <div key={key}>
        <MessageThread
          filterUserThread={filterUserThread}
          message={getProblemFiltered().concat(searchMessages)[index]}
          resolveMessage={resolveMessage}
          desktopPath={desktopPath}
        />
      </div>
    );
  }

  if (loading) {
    return <Loading />;
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
          <List
            width={700}
            height={600}
            rowHeight={getRowHeight}
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
        <WordsModal
          type="Add"
          deleteWord={deleteWord}
          confirmChanges={confirmChanges}
          setWords={setWords}
          addWords={addWords}
          omitWords={omitWords}
        />
      </Modal>
      <Modal
        open={showOmitWords}
        onClose={() => setShowOmitWords(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <WordsModal
          type="Omit"
          deleteWord={deleteWord}
          confirmChanges={confirmChanges}
          setWords={setWords}
          addWords={addWords}
          omitWords={omitWords}
        />
      </Modal>
      <Modal
        open={showMarkResolve}
        onClose={() => setShowMarkResolve(false)}
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
            Remember to Delete Your Message
          </Typography>
          <div style={{ width: '100%', height: 50, padding: 10 }}>
            <p style={{ marginBottom: 0, color: 'gray' }}>
              Remember to delete your message on Instagram
            </p>
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
