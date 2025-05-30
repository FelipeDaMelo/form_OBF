import React, { useState } from 'react';
import { db } from './firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDocs as getAllDocs
} from 'firebase/firestore';

function App() {
  const [matricula, setMatricula] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const buscarAluno = async () => {
    try {
      const q = query(collection(db, 'alunos'), where('matricula', '==', matricula));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErro('Matrícula não encontrada.');
        setNome('');
        setSerie('');
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setNome(data.nome);
        setSerie(data.serie);
        setErro('');
      });
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar dados.');
    }
  };

  const formatarData = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setDataNascimento(value);
  };

  const salvarFormulario = async () => {
    try {
      const email = \`\${matricula}@maristabrasil.g12.br\`;
      await addDoc(collection(db, 'respostasFormulario'), {
        matricula,
        nome,
        serie,
        dataNascimento,
        email,
        timestamp: new Date()
      });
      setMensagem('Dados salvos com sucesso!');
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao salvar os dados.');
    }
  };

  const exportarCSV = async () => {
    const querySnapshot = await getAllDocs(collection(db, 'respostasFormulario'));
    const dados = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dados.push({
        Nome: data.nome,
        Email: data.email,
        Série: data.serie,
        'Data de Nascimento': data.dataNascimento
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nome,Email,Série,Data de Nascimento']
        .concat(
          dados.map((d) =>
            [d.Nome, d.Email, d['Série'], d['Data de Nascimento']]
              .map((x) => \`"\${x}"\`)
              .join(',')
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'respostas_formulario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h1>Formulário de Aluno</h1>
      <input
        type="text"
        placeholder="Número de matrícula"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <button onClick={buscarAluno} style={{ marginBottom: '10px' }}>
        Buscar
      </button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {nome && (
        <div style={{ marginBottom: '10px' }}>
          <p><strong>Nome:</strong> {nome}</p>
          <p><strong>Série:</strong> {serie}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="Data de nascimento (DD/MM/AAAA)"
        value={dataNascimento}
        onChange={formatarData}
        maxLength={10}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <button onClick={salvarFormulario} style={{ marginBottom: '10px' }}>
        Salvar
      </button>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {matricula === '200291' && (
        <button onClick={exportarCSV} style={{ marginTop: '20px' }}>
          Exportar para Excel
        </button>
      )}
    </div>
  );
}

export default App;
