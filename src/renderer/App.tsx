import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import { useDropzone } from 'react-dropzone';

import './App.css';
import React from 'react';

const Hello = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [problemMessages, setProblemMessages] = React.useState([]);
  React.useEffect(() => {
    window.electron.ipcRenderer.on('problem-messages', (data) => {
      console.log(data);
      setProblemMessages(data);
    });
  }, []);

  React.useEffect(() => {
    const filePaths = acceptedFiles.map((f) => f.path);
    window.electron.ipcRenderer.sendMessage('file-drop', filePaths);
  }, [acceptedFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));
  return (
    <div>
      {' '}
      <section>
        <div
          {...getRootProps()}
          style={{ height: 100, border: '1px dashed black', cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          <p style={{ marginTop: 30, padding: 10 }}>
            Drag 'n' drop some files here, or click to select files
          </p>
        </div>
        <aside>
          <h4>Files</h4>
          <ul>Number: {files.length}</ul>
        </aside>
      </section>
      {problemMessages.length > 0 && (
        <div>
          <ul style={{ listStyleType: 'none' }}>
            {problemMessages.map((m) => (
              <div style={{ border: '1px solid #d3d3d3' }}>
                <h3>Chat: {m.title}</h3>
                <p>{m.content}</p>
                <i>Sent at {new Date(m.timestamp_ms).toLocaleDateString()}</i>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
