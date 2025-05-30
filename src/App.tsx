import React, { useState } from 'react';
import { db } from './firebaseConfig';
import './style.css';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDocs as getAllDocs,
  doc,
  getDoc,
  setDoc,
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
    // Verificações de campos obrigatórios
    if (!matricula.trim()) {
      setErro('Por favor, informe a matrícula.');
      return;
    }

    if (!dataNascimento.trim()) {
      setErro('Por favor, preencha a data de nascimento.');
      return;
    }
    // Validação de data
    const partes = dataNascimento.split('/');
    if (partes.length !== 3) {
      setErro('Data inválida. Use o formato DD/MM/AAAA.');
      return;
    }

    const [diaStr, mesStr, anoStr] = partes;
    const dia = parseInt(diaStr, 10);
    const mes = parseInt(mesStr, 10) - 1; // JavaScript: janeiro = 0
    const ano = parseInt(anoStr, 10);

    const dataValida = new Date(ano, mes, dia);
    if (
      dataValida.getFullYear() !== ano ||
      dataValida.getMonth() !== mes ||
      dataValida.getDate() !== dia
    ) {
      setErro('Data de nascimento inválida.');
      return;
    }

    // Impede datas fora do intervalo realista (ex: antes de 2000 ou após 2025)
    if (ano < 2000 || ano > 2020) {
      setErro('Ano de nascimento inválido.');
      return;
    }

    const email = `${matricula}@maristabrasil.g12.br`;

    const q = query(
      collection(db, 'respostasFormulario'),
      where('matricula', '==', matricula)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setErro('Você já enviou sua pré inscrição.');
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
    setErro('Erro ao salvar os dados.');
  }
};

const exportarCSV = async () => {
  type DadoAluno = {
    Nome: string;
    Email: string;
    Série: string;
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

  const csvHeader = 'Nome;Email;Série;Data de Nascimento';
  const csvBody = dados.map(d =>
    `${d.Nome};${d.Email};${d.Série};${d['Data de Nascimento']}`
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeader, ...csvBody].join('\n');

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
      {/* Logos */}
      <div className="flex justify-between items-center px-6 pt-6 max-w-6xl mx-auto">
        <img src="/logo-marista.png" alt="Logo Marista" className="h-40 object-contain" />
        <img src="/obf_t.png" alt="Logo OBF" className="h-40 object-contain" />
      </div>

      {/* Formulário principal */}
      <div className="w-full max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg font-sans">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6 leading-snug">
          Pré-inscrição para Olimpíada Brasileira de Física 2025
        </h1>

        <p className="text-gray-700 text-base mb-6 leading-relaxed text-justify">
          Este formulário tem como finalidade apenas confirmar suas informações e registrar sua data de nascimento.
          Digite sua matrícula para visualizar seus dados. Em seguida, preencha sua data de nascimento e clique em <strong>Enviar</strong> para concluir a pré-inscrição.
          Caso seu nome, matrícula ou série estejam incorretos, entre em contato com o professor Felipe no chat do Teams.
        </p>

        <input
          type="text"
          placeholder="Número de matrícula Ex: 10720******"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={buscarAluno}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mb-4 transition-colors"
        >
          Buscar
        </button>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {erro}
          </div>
        )}

        {nome && (
          <div className="mb-4 text-base text-gray-700">
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={salvarFormulario}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-4 transition-colors"
        >
          Enviar
        </button>

        {mensagem && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 font-semibold text-sm">
            {mensagem}
          </div>
        )}

        {matricula === '200291' && (
          <button
            onClick={exportarCSV}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Exportar para Excel
          </button>
        )}
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm z-50">
        Desenvolvido por Prof. Dr. Felipe Damas Melo
      </div>
    </>
  );
}

export default App;
