import React, { useState } from 'react';
import { db } from './firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDocs as getAllDocs,
  doc,
  getDoc,
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
      const docRef = doc(db, 'alunos', matricula);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setErro('Matrícula não encontrada.');
        setNome('');
        setSerie('');
        return;
      }

      const data = docSnap.data();
      setNome(data.nome);
      setSerie(data.serie);
      setErro('');
    } catch (err) {
      console.error('Erro Firebase:', err);
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
      const email = `${matricula}@maristabrasil.g12.br`;

      const q = query(
        collection(db, 'respostasFormulario'),
        where('matricula', '==', matricula)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMensagem('Você já respondeu este formulário.');
        return;
      }

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
    type DadoAluno = {
      Nome: string;
      Email: string;
      'Série': string;
      'Data de Nascimento': string;
    };

    const dados: DadoAluno[] = [];
    const querySnapshot = await getAllDocs(collection(db, 'respostasFormulario'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dados.push({
        Nome: data.nome,
        Email: data.email,
        Série: data.serie,
        'Data de Nascimento': data.dataNascimento,
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Nome,Email,Série,Data de Nascimento']
        .concat(
          dados.map((d) =>
            [d.Nome, d.Email, d['Série'], d['Data de Nascimento']]
              .map((x) => `"${x}"`)
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
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem 0',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        <img src="/logo-marista.png" alt="Logo Marista" style={{ height: '60px' }} />
        <img src="/obf_t.png" alt="Logo OBF" style={{ height: '60px' }} />
      </div>

      <div style={{
        padding: '2rem',
        maxWidth: '480px',
        margin: '2rem auto',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#1a1a1a'
        }}>
          Pré-inscrição para Olimpíada Brasileira de Física
        </h1>

        <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: '#4b5563' }}>
          Este formulário tem como objetivo apenas confirmar os dados e coletar a data de nascimento.
        </p>

        <input
          type="text"
          placeholder="Número de matrícula Ex: 10720******"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            marginBottom: '1rem'
          }}
        />

        <button
          onClick={buscarAluno}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '0.9rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          Buscar
        </button>

        {erro && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {erro}
          </div>
        )}

        {nome && (
          <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
            <p><strong>Nome:</strong> {nome}</p>
            <p><strong>Série:</strong> {serie}</p>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

        <input
          type="text"
          placeholder="Data de nascimento (DD/MM/AAAA)"
          value={dataNascimento}
          onChange={formatarData}
          maxLength={10}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            marginBottom: '1rem'
          }}
        />

        <button
          onClick={salvarFormulario}
          style={{
            width: '100%',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '0.9rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          Enviar
        </button>

        {mensagem && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#065f46',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {mensagem}
          </div>
        )}

        {matricula === '200291' && (
          <button
            onClick={exportarCSV}
            style={{
              width: '100%',
              backgroundColor: '#6b7280',
              color: '#fff',
              padding: '0.9rem',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Exportar para Excel
          </button>
        )}
      </div>
    </>
  );
}

export default App;
