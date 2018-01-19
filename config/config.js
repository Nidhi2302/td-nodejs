let devSetting = function() {};
devSetting.NOTIFICATION_OPTIONS = {
  production: process.env.PUSH_PRODUCTION,
  cert: process.env.CERT,
  key: process.env.SERTIFICATE_KEY,
  port: 443
};
devSetting.SECRET = process.env.SECRET_KEY
devSetting.AWS = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
  region: 'us-east-1'
}
devSetting.SITE_URL = process.env.SITE_URL
module.exports = devSetting;