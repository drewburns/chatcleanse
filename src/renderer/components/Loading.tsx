/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import React from 'react';
import { LinearProgress } from '@mui/material';

type Props = {};

export default function Loading({}: Props) {
  const navigation = useNavigate();

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  React.useEffect(() => {
    (async () => {
      // await delay(2000);
      // navigation('/results');
    })();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{width: '80%', alignItems: "center"}}>
        <h3 style={{textAlign: 'center'}}>Scanning...</h3>
        <LinearProgress />
      </div>
    </div>
  );
}
