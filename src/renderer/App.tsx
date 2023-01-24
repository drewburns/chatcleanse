/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import icon from '../../assets/icon.svg';
import { useDropzone } from 'react-dropzone';

import './App.css';
import React from 'react';
import { Card, Grid, LinearProgress } from '@mui/material';
import Results from './Results';
import Loading from './components/Loading';

const Hello = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [problemMessages, setProblemMessages] = React.useState([]);
  const navigation = useNavigate();

  React.useEffect(() => {
    window.electron.ipcRenderer.on('go-to-page', (page) => {
      navigation(page);
    });
  }, []);

  React.useEffect(() => {
    const filePaths = acceptedFiles.map((f) => f.path);
    window.electron.ipcRenderer.sendMessage('file-drop', filePaths);
    if (acceptedFiles && acceptedFiles.length > 0) {
      navigation('loading');
    }
  }, [acceptedFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));
  return (
    <Grid container>
      <Grid item xs={3} />
      <Grid item xs={6}>
        <Card className="helloCard">
          <h2 style={{ textAlign: 'center' }}>Chat Cleanse</h2>
          <div>
            <h4>Take action on old texts and more</h4>
            <p>
              Scan through thousands of DM's to find messages you want to delete
            </p>
          </div>
          <div>
            <h4>Paid, meaning totally private</h4>
            <p>
              Your data is yours. By charging to use ChatCleanse, we make sure
              privacy is always at the forefront
            </p>
          </div>
          <div>
            <h4>Have piece of mind</h4>
            <p>Freshen up your texts and protect your reputation</p>
          </div>
        </Card>
        <Card className="helloCard" style={{ textAlign: 'center' }}>
          <h3>Get started with your free message scan</h3>
          <p>Drag in your export from Instagram</p>
          <section>
            <div
              {...getRootProps()}
              style={{
                height: 100,
                border: '1px dashed black',
                cursor: 'pointer',
              }}
            >
              <input {...getInputProps()} />
              <p style={{ marginTop: 30, padding: 10 }}>
                Drag your folder here!
              </p>
            </div>
          </section>
        </Card>
      </Grid>
    </Grid>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

// {problemMessages.length > 0 && (
//   <div>
//     <ul style={{ listStyleType: 'none' }}>
//       {problemMessages.map((m) => (
//         <div style={{ border: '1px solid #d3d3d3' }}>
//           <h3>Chat: {m.title}</h3>
//           <p>{m.content}</p>
//           <i>
//             Sent at {new Date(m.timestamp_ms).toLocaleDateString()}
//           </i>
//         </div>
//       ))}
//     </ul>
//   </div>
// )}
