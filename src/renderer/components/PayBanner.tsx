import { Modal, Box, TextField, Button } from '@mui/material';
import React from 'react';

type Props = {
  setIsPaid: (val: boolean) => void;
  tryCode: (val: string) => void;
};

export default function PayBanner({ setIsPaid, tryCode }: Props) {
  const [showModal, setShowModal] = React.useState(false);
  const [userVal, setUserVal] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noreferrer');
  };

  return (
    <>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={style.modalStyle}>
          <h3>Enter your code</h3>
          <TextField
            label="Code"
            value={userVal}
            onChange={(e) => setUserVal(e.target.value)}
          />
          <br />
          <Button
            onClick={() => tryCode(userVal)}
            variant="contained"
            style={{ marginTop: 10, width: 200 }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
      <div
        style={{
          backgroundColor: 'white',
          width: '100%',
          height: 150,
          position: 'fixed',
          left: 0,
          bottom: 0,
          borderColor: '#f4f4f4',
        borderWidth: .5
      }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3>Subscribe to see all your issues</h3>
            <p style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => openInNewTab('https://buy.stripe.com/5kA9El8hc8Jk24McMN')}>
              Click here to subscribe
            </p>
          <p
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            Have a code? Click here
          </p>
        </div>
      </div>
    </>
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
