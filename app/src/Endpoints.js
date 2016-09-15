export default {
  sshUbuntu: process.env.SSH_UBUNTU_ENDPOINT || 'http://ssh.imad.hasura-app.io:8080' 
  dbUbuntu: process.env.DB_UBUNTU_ENDPOINT || 'http://db.imad.hasura-app.io:8080'
};
