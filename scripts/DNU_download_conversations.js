const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${dest}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadSamples() {
  try {
    // Create demo directory if it doesn't exist
    const demoDir = path.join(process.cwd(), 'data', 'meeting_recordings', 'demo');
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }

    // Sample conversation URLs from Mozilla Common Voice and other public datasets
    const samples = [
      {
        id: 'business-meeting-1',
        name: 'Business Planning Meeting',
        url: 'https://github.com/mozilla/DeepSpeech/raw/master/data/smoke_test/LDC93S1.wav',
        date: new Date().toISOString(),
        duration: 5.5,
        participants: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
        topics: ['Project Planning', 'Resource Allocation']
      },
      {
        id: 'team-discussion-1',
        name: 'Team Discussion',
        url: 'https://github.com/sindresorhus/file-type/raw/main/fixture-coverage/wav/fixture.wav',
        date: new Date(Date.now() - 86400000).toISOString(),
        duration: 2.5,
        participants: ['Emma Davis', 'David Brown', 'Lisa Anderson'],
        topics: ['Product Review', 'Team Updates']
      }
    ];

    // Download each sample
    for (const sample of samples) {
      const audioPath = path.join(demoDir, `${sample.id}.wav`);
      await downloadFile(sample.url, audioPath);
    }

    // Save metadata
    const metadata = {
      meetings: samples.map(({ url, ...meeting }) => ({
        ...meeting,
        path: path.join(demoDir, `${meeting.id}.wav`).replace(/\\/g, '/')
      }))
    };

    fs.writeFileSync(
      path.join(demoDir, 'conversations-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log('Sample conversations downloaded successfully!');
  } catch (error) {
    console.error('Error downloading samples:', error);
    process.exit(1);
  }
}

downloadSamples(); 