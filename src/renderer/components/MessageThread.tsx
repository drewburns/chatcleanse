import { Card, Grid } from '@mui/material';

type Props = {
  message: any;
  desktopPath: string;
  resolveMessage: (val: number) => void;
  isSearch: boolean;
  displayModalOnboarding: () => void;
  filterUserThread: () => void;
};

export default function MessageThread({
  message,
  resolveMessage,
  desktopPath,
  displayModalOnboarding,
  filterUserThread,
  isSearch,
}: Props) {
  function unique(array, propertyName) {
    return array.filter(
      (e, i) =>
        array.findIndex((a) => a[propertyName] === e[propertyName]) === i
    );
  }

  const resolveClicked = (time) => {
    displayModalOnboarding();
    resolveMessage(time);
  };

  const orderAndCleanMessages = (message) => {
    return unique(message.context.concat(message), 'timestamp_ms').sort(
      (a, b) => a.timestamp_ms - b.timestamp_ms
    );
  };

  const displayImages = (photos) => {
    return (
      <div>
        {photos.map((photo) => (
          <img
            style={{ height: 150 }}
            src={`file://${desktopPath}/chatcleanse_data/${photo.uri}`}
          />
        ))}
      </div>
    );
  };

  const displayAudio = (audioFiles) => {
    return (
      <div>
        {audioFiles.map((audio) => (
          <audio controls>
            <source
              src={`file://${desktopPath}/chatcleanse_data/${audio.uri}`}
              type="audio/mp4"
            />
          </audio>
        ))}
      </div>
    );
  };

  return (
    <Card
      style={{
        marginTop: 10,
        marginRight: 3,
        marginLeft: 3,
        paddingLeft: 20,
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingRight: 20,
        }}
      >
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => filterUserThread(message.thread_path)}
        >
          <p
            style={{
              fontWeight: 'bold',
              marginBottom: 0,
              fontSize: 19,
            }}
          >
            {decodeURIComponent(escape(message.title))}
          </p>
          <p
            style={{
              marginTop: 4,
              fontSize: 12,
              color: '#999999',
            }}
          >
            See all from sender
          </p>
        </div>

        <p
          style={{
            paddingTop: 8,
          }}
        >
          {new Date(message.timestamp_ms).toLocaleDateString()}
        </p>
      </div>

      {orderAndCleanMessages(message).map((cm) => (
        <Grid container style={{ paddingRight: 10 }}>
          {cm.sender_name === message.username && <Grid item xs={6} md={5} />}
          <div
            style={{
              backgroundColor:
                cm.sender_name === message.username ? '#0A82F5' : '#D2D2D2',
              color: cm.sender_name === message.username ? 'white' : 'black',
              textAlign: cm.sender_name === message.username ? 'left' : 'left',
              paddingRight: 15,
              paddingLeft: 15,
              marginLeft: cm.sender_name === message.username ? 'auto' : 0,
              marginTop: 10,
              marginRight: cm.sender_name === message.username ? 10 : null,
              marginRight:
                cm.timestamp_ms !== message.timestamp_ms &&
                cm.sender_name === message.username &&
                30,
              borderRadius: 20,
              marginBottom: 10,
              maxWidth: 300,
            }}
          >
            {cm.content && <p>{decodeURIComponent(escape(cm.content))}</p>}
            {cm.photos && displayImages(cm.photos)}
            {cm.audio_files && displayAudio(cm.audio_files)}
          </div>
          {cm.timestamp_ms === message.timestamp_ms && !isSearch && (
            <div className="problemDot" />
          )}
        </Grid>
      ))}
      {!isSearch && (
        <div
          style={{
            cursor: 'pointer',
            display: 'flex',
            float: 'right',
            marginTop: 20,
            height: 43,
            width: 143,
            marginRight: 20,
            backgroundColor: 'black',
            color: 'white',
            borderRadius: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => resolveClicked(message.timestamp_ms)}
        >
          Mark Resolved
        </div>
      )}
    </Card>
  );
}
