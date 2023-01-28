/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { TextField, Button, Modal, Box, Typography } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import React from 'react';
import WordsModal from "./WordsModal";

type Props = {
  problemMessages: any[];
  setShowAddWords: (val: boolean) => void;
  setShowOmitWords: (val: boolean) => void;
  setSearchTerm: (val: string) => void;
  searchTerm: string;
  reset: () => void;
  startSearch: () => void;
};

export default function TopBar({
  isPaid,
  problemMessages,
  setShowAddWords,
  setShowOmitWords,
  setSearchTerm,
  reset,
  startSearch,
  searchTerm,
}: Props) {

  const [showResetModal, setShowResetModal] = React.useState(false);

  const clickHandler = (button) => {
    if (button === 'omit' && isPaid === false) { return alert('Upgrade to unlock') }
    if (button === 'add' && isPaid === false) { return alert('Upgrade to unlock') }
    if (button === 'search' && isPaid === false) { return alert('Upgrade to unlock') }
    if (button === 'omit') { return setShowOmitWords(true) }
    if (button === 'add') { return setShowAddWords(true) }
    if (button === 'search') {return startSearch}
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ marginBottom: 0, fontSize: 20, fontWeight: 'bold' }}>
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
            onClick={() => clickHandler('add')}
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
            onClick={() => clickHandler('omit')}
          >
            <p>Omit Words</p>
          </div>
          <div
            onClick={() => setShowResetModal(true)}
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
          <div
            style={{
              cursor: 'pointer',
              height: 40,
              width: 40,
              borderRadius: 20,
              border: '1px solid black',
              marginLeft: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon style={{ height: 30, width: 30 }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          id="outlined-basic"
          label="Search for a text"
          variant="outlined"
          onKeyUp={(event) => {
            if (event.key === 'Enter') startSearch();
          }}
        />
        <Button
          onClick={() =>clickHandler('search')}
          style={{ backgroundColor: 'black', color: 'white', width: 100 }}
        >
          Search
        </Button>
      </div>
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
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
            Start a new scan
          </Typography>
          <p style={{ maxWidth: 280 }}>Remember to export from Instagram again to reflect your changes -<a href="https://help.instagram.com/181231772500920" target="_blank" rel="noopener noreferrer">See how
          </a>
          </p>

          <Button
            onClick={() => reset()}
            style={{ backgroundColor: 'black', color: 'white', width: 100, marginBottom: 0, marginTop: 10}}
          >
            confirm
          </Button>
          <p style={{ cursor: 'pointer', marginTop: 15}} onClick={() =>setShowResetModal(false)}>
            back
          </p>
        </Box>
      </Modal>
    </>
  );
}

const style = {
  modalStyle: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
};
