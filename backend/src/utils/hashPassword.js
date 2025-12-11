import bcrypt from 'bcryptjs';

// Utilitaire pour hasher un mot de passe
// Utiliser pour générer le hash du mot de passe admin

const password = process.argv[2] || 'Admin@123456';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
  
  console.log('\n=================================');
  console.log('Mot de passe:', password);
  console.log('Hash bcrypt:', hash);
  console.log('=================================\n');
  console.log('Utilisez ce hash dans votre fichier SQL ou pour mettre à jour le mot de passe admin.');
  console.log('\nExemple SQL:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@archexcellence.ci';`);
  console.log('\n');
});
