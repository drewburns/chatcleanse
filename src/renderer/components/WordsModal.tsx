import { Box, TextField, Typography } from '@mui/material';
import React from 'react';

type Props = {
  type: string;
  omitWords: string[];
  addWords: string[];
  setWords: (type: string, newWord: string) => void;
  deleteWord: (type: string, deleteWord: string) => void;
};

export default function WordsModal({
  type,
  omitWords,
  addWords,
  setWords,
  deleteWord,
}: Props) {
  const wordsToShow = type === 'Omit' ? omitWords : addWords;
  const [newWord, setNewWord] = React.useState('');
  return (
    <Box sx={style.modalStyle}>
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        style={{ marginBottom: 15 }}
      >
        Words to {type}
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
        }}
      >
        <TextField
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          label={`${type} word`}
          style={{ width: '100%' }}
        />
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
          onClick={() => setWords(type, newWord)}
        >
          <p style={{ color: 'white' }}>Add</p>
        </div>
      </div>
      <div>
        {wordsToShow.map((word) => (
          <div style={{ display: 'flex' }}>
            <p>{word}</p>
            <p
              onClick={() => deleteWord(type, word)}
              style={{ color: 'red', marginLeft: 15, cursor: 'pointer' }}
            >
              X
            </p>
          </div>
        ))}
      </div>
    </Box>
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
