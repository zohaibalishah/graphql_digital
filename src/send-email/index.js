const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const sendEmail = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      message,
    } = req.body

    const emailParams = {
      Destination: {
        ToAddresses: ['marc@airstayz.co'],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `${firstName} ${lastName} ${email} \n ${message}`,
          },
         },
         Subject: {
          Charset: 'UTF-8',
          Data: 'Test',
         }
        },
      Source: 'andymalkin@gmail.com',
    };

    const publishEmailPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(emailParams)
      .promise()

    await publishEmailPromise
    
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
}

module.exports = sendEmail
