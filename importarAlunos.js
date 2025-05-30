
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const alunos = require('./alunos_firestore.json');
const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function importarAlunos() {
  const batch = db.batch();

  alunos.forEach((aluno) => {
    const docRef = db.collection('alunos').doc(aluno.matricula.toString());
    batch.set(docRef, {
      matricula: aluno.matricula.toString(),
      nome: aluno.nome,
      serie: aluno.serie.toString(),
    });
  });

  await batch.commit();
  console.log('Importação concluída com sucesso.');
}

importarAlunos().catch(console.error);
