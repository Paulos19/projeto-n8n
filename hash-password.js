const bcrypt = require('bcryptjs');
const password = 'password'; // A senha que você quer hashear
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erro ao gerar hash:', err);
    return;
  }
  console.log('Senha original:', password);
  console.log('Hash gerado:', hash);
});