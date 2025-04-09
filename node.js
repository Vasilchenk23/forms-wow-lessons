require('dotenv').config();

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('server.log', logMessage);
}

app.post('/send-lead', async (req, res) => {
  const { name, email, message } = req.body;

  logToFile(`Get data: name=${name}, email=${email}, message=${message}`);

  const payload = {
    title: "Звернення з сайту wow-уроків",
    manager_comment: message,
    manager_id: 3,
    pipeline_id: 8,
    status_id: 85,
    source_id: 15,
    communicate_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    contact: {
      full_name: name,
      email: email
    },
  };

  logToFile(`Send data in CRM: ${JSON.stringify(payload)}`);

  try {
    const response = await axios.post(
      'https://openapi.keycrm.app/v1/pipelines/cards',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CRM_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logToFile(`Response on CRM: ${JSON.stringify(response.data)}`);

    res.json({ success: true, data: response.data });
  } catch (error) {
    if (error.response) {
      logToFile(`Error lead ${JSON.stringify(error.response.data)}`);
    } else {
      logToFile(`Error lead ${error.message}`);
    }
    
    res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server run ${PORT}`);
});
