/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import React from 'react';

type Props = {
  problemMessages: any[];
  setShowAddWords: (val: boolean) => void;
  setShowOmitWords: (val: boolean) => void;
  setSearchTerm: (val: string) => void;
  searchTerm: string;
  reset: () => void;
};

export default function TopBar({
  problemMessages,
  setShowAddWords,
  setShowOmitWords,
  setSearchTerm,
  reset,
  searchTerm,
}: Props) {
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
            onClick={() => setShowAddWords(true)}
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
            onClick={() => setShowOmitWords(true)}
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
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        id="outlined-basic"
        label="Search for a text"
        variant="outlined"
      />
    </>
  );
}
