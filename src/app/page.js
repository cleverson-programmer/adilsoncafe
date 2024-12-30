"use client";
import { jsPDF } from "jspdf";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaSave, FaPrint } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";

export default function Home() {
  const [pesos, setPesos] = useState([]);
  const [novoPeso, setNovoPeso] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);
  const [editandoPeso, setEditandoPeso] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [tipoProduto, setTipoProduto] = useState("");
  const [limparCampos, setLimparCampos] = useState(false);
  const [erro, setErro] = useState("");

  const validarEntradas = () => {
    if (!nomeCliente.trim()) {
      setErro("Por favor, preencha o nome do cliente.");
      return false;
    }
    if (!tipoProduto) {
      setErro("Por favor, selecione o tipo de produto.");
      return false;
    }
    if (pesos.length === 0) {
      setErro("Por favor, adicione ao menos um peso.");
      return false;
    }
    setErro("");
    return true;
  };

  const adicionarPeso = () => {
    const pesoNormalizado = novoPeso.replace(",", ".");
    if (!isNaN(pesoNormalizado) && pesoNormalizado.trim() !== "") {
      setPesos([...pesos, parseFloat(pesoNormalizado)]);
      setNovoPeso("");
    }
  };

  // Excluir um peso
  const excluirPeso = (index) => {
    const novosPesos = pesos.filter((_, i) => i !== index);
    setPesos(novosPesos);
  };

  // Entrar no modo de edição
  const iniciarEdicao = (index) => {
    setEditandoIndex(index);
    setEditandoPeso(pesos[index]);
  };

  // Salvar a edição
  const salvarEdicao = () => {
    const novosPesos = pesos.map((peso, index) =>
      index === editandoIndex ? parseFloat(editandoPeso) : peso
    );
    setPesos(novosPesos);
    setEditandoIndex(null);
    setEditandoPeso("");
  };

  // Ajustar as coordenadas de cada linha no PDF
  const salvarDados = () => {
    if (!validarEntradas()) return;
    const confirmar = window.confirm("Deseja realmente salvar os dados?");
    if (confirmar) {
      const doc = new jsPDF();

      // Adicionar título
      doc.setFontSize(12);
      doc.text("Informações do Cliente", 10, 20);

      // Adicionar dados principais
      doc.setFontSize(10);
      doc.text(`Nome: ${nomeCliente}`, 10, 30);
      doc.text(`Telefone: ${telefoneCliente}`, 10, 36);
      doc.text(`Tipo de Produto: ${tipoProduto}`, 10, 42);

      // Adicionar pesos com alinhamento
      doc.text("Pesos:", 10, 50);
      pesos.forEach((peso, index) => {
        doc.text(`Peso ${index + 1} (KG):`, 10, 56 + index * 6); // Coluna 1
        doc.text(`${peso.toFixed(2).replace(".", ",")}`, 50, 56 + index * 6); // Coluna 2
      });

      // Adicionar total
      doc.text(`Total (KG): ${somaPesos.toFixed(2).replace(".", ",")}`, 10, 56 + pesos.length * 6 + 6);

      // Adicionar rodapé
      doc.text("Todos os direitos reservados.", 10, 120);
      doc.text("ADILSON CAFÉ & COMPANHIA LTDA", 10, 126);
      doc.text("33 8763-1216", 10, 132);
      doc.text("ATENÇÃO: Esta guia não possui valor fiscal ou legal. Ela é apenas informativa e contém os pesos dos produtos para conferência do cliente.", 10, 138, { maxWidth: 190 });

      // Salvar o PDF
      doc.save(`${nomeCliente}_salvo.pdf`);
      alert("Dados salvos com sucesso!");

      // Ativar a limpeza dos campos
      setLimparCampos(true);

    }
  };

  // UseEffect para limpar os campos quando `limparCampos` for ativado
  useEffect(() => {
    if (limparCampos) {
      setNomeCliente("");
      setTelefoneCliente("");
      setTipoProduto("");
      setPesos([]);
      setNovoPeso("");
      setEditandoIndex(null);
      setEditandoPeso("");
      setErro("");
      setLimparCampos(false); // Resetar o estado de limpeza
    }
  }, [limparCampos]);


  const gerarConteudo = () => {
    return `
      <h1>Informações do Cliente</h1>
      <p><strong>Nome:</strong> ${nomeCliente}</p>
      <p><strong>Telefone:</strong> ${telefoneCliente}</p>
      <p><strong>Tipo de Café:</strong> ${tipoProduto}</p>
      <h2>Pesos</h2>
      <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Peso (KG)</th>
          </tr>
        </thead>
        <tbody>
          ${pesos
        .map(
          (peso) => `<tr><td>${peso.toFixed(2).replace(".", ",")}</td></tr>`
        )
        .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total (KG):</strong> ${somaPesos
        .toFixed(2)
        .replace(".", ",")}</td>
          </tr>
        </tfoot>
      </table>
      <p>Todos os direitos reservados.</p>
      <p><strong>ADILSON CAFÉ & COMPANHIA LTDA <br/> 33 8763-1216</strong></p>
      <span>ATENÇÃO: Esta guia não possui valor fiscal ou legal. Ela é apenas informativa e contém os pesos dos produtos para conferência do cliente.</span>
    `;
  };

  const imprimirDados = () => {
    if (!validarEntradas()) return;
    const conteudo = gerarConteudo();
    const janelaImpressao = window.open("", "_blank");
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>${nomeCliente}_impresso</title>
        </head>
        <body>
          ${conteudo}
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  const somaPesos = pesos.reduce((acc, peso) => acc + peso, 0);

  return (
    <div className="min-h-screen bg-slate-200 p-6">
      <div className="flex justify-center py-4 bg-gray-800">
        <h1 className="text-3xl font-bold text-white">ADILSON CAFÉ</h1>
      </div>

      <form className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-xl mx-auto">
        {erro && <div className="text-red-500 mb-4">{erro}</div>}
        <fieldset className="mb-4">
          <legend className="text-lg font-bold mb-2">Informações do cliente:</legend>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Digite o nome do cliente"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 mb-4 placeholder-gray-500"
          />
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Digite o telefone do cliente"
            value={telefoneCliente}
            onChange={(e) => setTelefoneCliente(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 placeholder-gray-500"
          />
        </fieldset>

        <fieldset>
          <legend className="text-lg font-bold text-black mb-2">Café:</legend>
          <label htmlFor="type" className="block text-sm font-medium text-black">
            Tipo:
          </label>
          <select
            id="type"
            name="type"
            value={tipoProduto}
            onChange={(e) => setTipoProduto(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
          >
            <option value="">Selecione</option>
            <option value="Café seco">Café seco</option>
            <option value="Café maduro">Café maduro</option>
            <option value="Café limpo">Café limpo</option>
          </select>
        </fieldset>
      </form>

      <div className="bg-white shadow-md rounded-lg p-6 mt-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-black mb-4">Controle</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
          <input
            type="text"
            placeholder="Digite o peso (KG)"
            value={novoPeso}
            onChange={(e) => setNovoPeso(e.target.value)}
            className="w-full sm:flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={adicionarPeso}
            className="w-full sm:w-auto px-4 py-2 bg-green-500 flex justify-center text-center items-center gap-2 text-white rounded-lg shadow hover:bg-green-600"
          >
            <IoIosAddCircleOutline /> Adicionar
          </button>
        </div>

        <table className="table-auto w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-black">Peso (KG)</th>
              <th className="border border-gray-300 px-4 py-2 text-black">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pesos.map((peso, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {editandoIndex === index ? (
                    <input
                      type="text"
                      value={editandoPeso}
                      onChange={(e) => setEditandoPeso(e.target.value)}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-1"
                    />
                  ) : (
                    peso
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  {editandoIndex === index ? (
                    <>
                      <button
                        onClick={salvarEdicao}
                        className="text-blue-600 hover:underline"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditandoIndex(null)}
                        className="text-red-600 hover:underline"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => iniciarEdicao(index)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => excluirPeso(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td className="border border-gray-300 px-4 py-2 text-black font-bold">Total (KG)</td>
              <td className="border border-gray-300 px-4 py-2 text-black">{somaPesos.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-between mt-6">
          <button
            onClick={salvarDados}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 flex items-center space-x-2"
          >
            <FaSave />
            <span>Salvar</span>
          </button>
          <button
            onClick={imprimirDados}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 flex items-center space-x-2"
          >
            <FaPrint />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>

  );
}
