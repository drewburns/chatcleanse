/* eslint-disable promise/param-names */
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import icon from './icon.png';
import './App.css';
import React from 'react';
import { Card, Grid, LinearProgress } from '@mui/material';
import Results from './Results';
import Loading from './components/Loading';

const Hello = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    noClick: true,
  });
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
        <Card className="helloCard" style={{ textAlign: 'center' }}>
          <div style={{ marginLeft: 50, marginRight: 50 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              <img
                src={icon}
                style={{
                  height: 35,
                  borderRadius: '100%',
                  marginTop: 15,
                  marginRight: 5,
                }}
                alt="logo"
              />
              <h2 style={{ textAlign: 'center', color: '#565656' }}>
                Chat Cleanse
              </h2>
              <br />
            </div>
            <h3>Start your scan</h3>
            <div style={{ textAlign: 'left' }}>
              <p>Export your instagram data, then drag the folder below.</p>
              <p>
                To see how to export, use Instagram's directions{' '}
                <a
                  onClick={() =>
                    window.electron.ipcRenderer.sendMessage(
                      'openLink',
                      'https://help.instagram.com/181231772500920'
                    )
                  }
                  style={{
                    cursor: 'pointer',
                    margin: 0,
                    color: 'black',
                    fontWeight: 'bold',
                  }}
                >
                  here
                </a>{' '}
                and export as JSON.
              </p>
              <p>Remember to uncompress the file before adding below.</p>
              <p>Chat Cleanse gives you control over your data</p>
            </div>
            {/* <p>
            Drag in your <span style={{ fontWeight: 'bold' }}>JSON export</span>{' '}
            from Instagram -
            <a
              href="https://help.instagram.com/181231772500920"
              target="_blank"
              rel="noopener noreferrer"
            >
              see how
            </a>
          </p> */}
            <section>
              <div
                {...getRootProps()}
                style={{
                  height: 150,
                  border: '1px solid #999FE7',
                  backgroundColor: '#F9F9F9',
                  cursor: 'pointer',
                  borderRadius: 10,
                }}
              >
                <input {...getInputProps()} />
                <p style={{ marginTop: 60, padding: 10, color: '#959595' }}>
                  Drag your folder here
                </p>
              </div>
            </section>
            <p style={{ color: '#9A9A9A', fontSize: 15, marginBottom: 50 }}>
              By using, you agree with our Terms of Service and Privacy Policy.
              We're proud that all your data stavs local and private.
            </p>
          </div>
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
