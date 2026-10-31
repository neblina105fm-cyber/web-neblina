const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleSection.jsx', 'utf8');

content = content.replace(
  "import { getAllSchedule } from '../services/scheduleData';",
  "import { getAllSchedule } from '../services/scheduleData';\nimport { useAudioPlayer } from '../context/AudioPlayerContext';"
);

content = content.replace(
  "export default function ScheduleSection({ onPlayLive }) {",
  `export default function ScheduleSection({ onPlayLive }) {
  let playLiveStream = null;
  try {
    const player = useAudioPlayer();
    playLiveStream = player ? player.playLiveStream : null;
  } catch (e) {}`
);

content = content.replace(
  "{onPlayLive && (",
  "{(onPlayLive || playLiveStream) && ("
);

content = content.replace(
  `onClick={() => {
                      onPlayLive();
                      setSelectedShow(null);
                    }}`,
  `onClick={() => {
                      if (onPlayLive) onPlayLive();
                      else if (playLiveStream) playLiveStream();
                      setSelectedShow(null);
                    }}`
);

fs.writeFileSync('src/components/ScheduleSection.jsx', content, 'utf8');
console.log('ScheduleSection audio player connected successfully!');
