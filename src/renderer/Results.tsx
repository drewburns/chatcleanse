/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import axios from 'axios';

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
  Pagination,
} from '@mui/material';
import TopBar from './components/TopBar';
import MessageThread from './components/MessageThread';
import WordsModal from './components/WordsModal';
import Loading from './components/Loading';
import PayBanner from './components/PayBanner';
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
  const [itemOffset, setItemOffset] = React.useState(0);
  const [isPaid, setIsPaid] = React.useState(false);

  const itemsPerPage = 20;

  const tryCode = (code: string) => {
    console.log('enw code', code);
    window.electron.ipcRenderer.sendMessage('set-code', code);
    axios
      .get('https://gist.github.com/drewburns/9bb4bb64eaa454e7a8982d16d3ef7e39')
      .then((res) => {
        const regex = /===.+===/;
        const paidUsers = res.data
          .match(regex)[0]
          .replaceAll('===', '')
          .split(',')
          .filter((x) => x);
        console.log('paid user', paidUsers);
        setIsPaid(paidUsers.includes(code));
      })
      .catch(() => {
        setIsPaid(false);
      });
  };

  React.useEffect(() => {
    window.electron.ipcRenderer.sendMessage('getProblemMessages');
    window.electron.ipcRenderer.sendMessage('get-code');
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
      setItemOffset(0);
    });

    window.electron.ipcRenderer.on('problemMessages', (data) => {
      setProblemMessages(data.messages);
      setDesktopPath(data.desktopPath);
      setLoading(false);
      setItemOffset(0);
    });

    window.electron.ipcRenderer.on('get-code', (code) => {
      tryCode(code);
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
    setShowMarkResolve(true);
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
    setLoading(true);
    setShowAddWords(false);
    setShowOmitWords(false);
    if (type === 'Omit') {
      window.electron.ipcRenderer.sendMessage('set-omit-words', omitWords);
      window.electron.ipcRenderer.sendMessage('getProblemMessages');
      return;
    }
    window.electron.ipcRenderer.sendMessage('set-add-words', addWords);
    window.electron.ipcRenderer.sendMessage('getProblemMessages');
  };

  const resolveMessage = (timestamp: number) => {
    window.electron.ipcRenderer.sendMessage('resolveMessage', timestamp);
    const copyMessages = [...problemMessages];
    setProblemMessages(
      copyMessages.filter((m) => m.timestamp_ms !== timestamp)
    );
  };

  const allMessages = getProblemFiltered().concat(searchMessages);
  const endOffset = itemOffset + itemsPerPage;
  const pageCount = Math.ceil(allMessages.length / itemsPerPage);

  const allMessagesPaginated = allMessages.slice(itemOffset, endOffset);

  const handlePageClick = (event, value) => {
    const newOffset = ((value - 1) * itemsPerPage) % allMessages.length;
    setItemOffset(newOffset);
    window.scrollTo(0, 0);
  };

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
            isPaid={isPaid}
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
          {allMessagesPaginated.map((message) => (
            <MessageThread
              isPaid={isPaid}
              filterUserThread={filterUserThread}
              message={message}
              onboardingShown={onboardingShown}
              displayModalOnboarding={displayModalOnboarding}
              resolveMessage={resolveMessage}
              desktopPath={desktopPath}
            />
          ))}
          {isPaid && (
            <div
              style={{
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                marginTop: 16,
                marginBottom: 30,
              }}
            >
              <Pagination
                count={pageCount}
                showLastButton
                showFirstButton
                onChange={handlePageClick}
                color="primary"
              />
            </div>
          )}
          {!isPaid && <PayBanner setIsPaid={setIsPaid} tryCode={tryCode} />}
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
          style={{ marginBottom: 0 }}
        >
          Resolve After You Delete
        </Typography>
        <p style={{ maxWidth: 280 }}>Go directly to the message in Instagram. Press and hold until it displays 'delete.' Doing so will delete for both parties. Afterwards, mark as resolved.</p>
        <Button
          onClick={() => setShowMarkResolve(false)}
          style={{ backgroundColor: 'black', color: 'white', width: 100, marginBottom: 0, marginTop: 10}}
        >
          Got it
        </Button>
        <p style={{ cursor: 'pointer', marginTop: 15, position: 'absolute', top: 5, right: 20 }} onClick={() => setShowMarkResolve(false)}>
          back
        </p>
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
    width: 360,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    outline: 'none',
  },
};
