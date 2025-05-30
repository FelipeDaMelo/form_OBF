
import { useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDocs as getAllDocs,
} from "firebase/firestore";

export default function FormularioAluno() {
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const buscarAluno = async () => {
    try {
      const q = query(collection(db, "alunos"), where("matricula", "==", matricula));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setErro("Matrícula não encontrada.");
        setNome("");
        setSerie("");
        return;
      }

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setNome(data.nome);
        setSerie(data.serie);
        setErro("");
      });
    } catch (err) {
      console.error(err);
      setErro("Erro ao buscar dados.");
    }
  };

  const formatarData = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);
    setDataNascimento(value);
  };

  const salvarFormulario = async () => {
    try {
      const email = \`\${matricula}@maristabrasil.g12.br\`;
      await addDoc(collection(db, "respostasFormulario"), {
        matricula,
        nome,
        serie,
        dataNascimento,
        email,
        timestamp: new Date(),
      });
      setMensagem("Dados salvos com sucesso!");
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar os dados.");
    }
  };

  const exportarCSV = async () => {
    const querySnapshot = await getAllDocs(collection(db, "respostasFormulario"));
    const dados = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      dados.push({
        Nome: data.nome,
        Email: data.email,
        Série: data.serie,
        "Data de Nascimento": data.dataNascimento,
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Nome,Email,Série,Data de Nascimento"]
        .concat(
          dados.map((d) =>
            [d.Nome, d.Email, d["Série"], d["Data de Nascimento"]]
              .map((x) => \`"\${x}"\`)
              .join(",")
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "respostas_formulario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Formulário do Aluno</h1>

      <input
        type="text"
        placeholder="Número de matrícula"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button onClick={buscarAluno} className="bg-blue-500 text-white p-2 w-full mb-2">
        Buscar
      </button>

      {erro && <p className="text-red-500">{erro}</p>}

      {nome && (
        <div className="mb-2">
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
        className="border p-2 w-full mb-2"
      />

      <button onClick={salvarFormulario} className="bg-green-500 text-white p-2 w-full mb-2">
        Salvar
      </button>

      {mensagem && <p className="text-blue-500">{mensagem}</p>}

      {matricula === "200291" && (
        <button onClick={exportarCSV} className="bg-purple-600 text-white p-2 w-full mt-4">
          Exportar para Excel
        </button>
      )}
    </div>
  );
}
