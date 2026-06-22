const SUPABASE_URL = "";
const SUPABASE_KEY = "";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

async function listarContatos() {
    const { data, error } = await supabaseClient.from('contatos').select('*').order('id');
    if (error) {
        console.error(error);
        return;
    }
    renderizarTabela(data);
}

function renderizarTabela(contatos) {

    const tabela = document.getElementById("tabelaContatos");
    tabela.innerHTML = "";
    contatos.forEach(contato => {
        tabela.innerHTML += `
            <tr>
                <th scope="row">${contato.id}</th>
                <td>${contato.nome}</td>
                <td>${formatarTelefone(contato.telefone)}</td>
                <td>${contato.email ?? ''}</td>
                <td>
                    <button type="button" class="btn btn-primary" onclick='abrirModalEdicao(${JSON.stringify(contato)})'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                    <button class="btn btn-danger" onclick='abrirModalExclusao(${JSON.stringify(contato)})'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
}

function formatarTelefone(telefone) {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return numeros.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
        );
    }
    if (numeros.length === 10) {
        return numeros.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
        );
    }
    return telefone;
}

document.getElementById('telefone').addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = valor;
});

document.getElementById('telefoneContatoInputEdit').addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
    valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = valor;
});

async function salvarContato() {
    const id = document.getElementById("contatoId").value;
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;

    await supabaseClient
        .from("contatos")
        .insert([{ nome, telefone, email }]);

    limparFormulario();
    listarContatos();
    fecharModal();
}

async function atualizarContato() {
    const id = document.getElementById("idContatoInputEdit").value;
    const nome = document.getElementById("nomeContatoInputEdit").value;
    const telefone = document.getElementById("telefoneContatoInputEdit").value;
    const email = document.getElementById("emailContatoInputEdit").value;

    const { data, error } = await supabaseClient
        .from("contatos")
        .update({
            nome,
            telefone,
            email
        })
        .eq("id", id)
        .select();

    console.log("Data:", data);
    console.log("Error:", error);

    fecharModalEdicao();
    limparFormulario();
    await listarContatos();
}

async function excluirContato() {
    const id = document.getElementById("idContatoInputExclusao").value;
    console.log("ID para excluir:", id);
    await supabaseClient
        .from("contatos")
        .delete()
        .eq("id", id);

    limparFormulario();
    listarContatos();
    fecharModalExclusao();
}

async function buscarContato() {
    const nome = document.getElementById("buscaNome").value;

    const { data } = await supabaseClient
        .from("contatos")
        .select("*")
        .ilike("nome", `%${nome}%`);

    renderizarTabela(data);
}

function limparFormulario() {
    document.getElementById("contatoId").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";
}

async function abrirModalEdicao(contato) {
    const { id, nome, telefone, email } = contato
    document.getElementById("idContatoInputEdit").value = id;
    document.getElementById("nomeContatoInputEdit").value = nome;
    document.getElementById("telefoneContatoInputEdit").value = telefone;
    document.getElementById("emailContatoInputEdit").value = email;
    const modal = new bootstrap.Modal(document.getElementById("modalEditarContato")).show();
}

async function abrirModalExclusao(contato) {
    const { id, nome, telefone, email } = contato
    document.getElementById("idContatoInputExclusao").value = id;
    const modal = new bootstrap.Modal(document.getElementById("modalExcluirContato")).show();
}

function fecharModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalContato"));
    if (modal) modal.hide();
}

function fecharModalEdicao() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarContato"));
    if (modal) modal.hide();
}

function fecharModalExclusao() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalExcluirContato"));
    if (modal) modal.hide();
}

async function carregarContato(id) {
    const { data } = await supabaseClient
        .from("contatos")
        .select("*")
        .eq("id", id)
        .single();

    document.getElementById("contatoId").value = data.id;
    document.getElementById("nome").value = data.nome;
    document.getElementById("telefone").value = data.telefone;
    document.getElementById("email").value = data.email;
}

document.getElementById("btnBuscar").addEventListener("click", buscarContato);

document.getElementById("btnCancelar").addEventListener("click", limparFormulario);

document.getElementById("btnNovo").addEventListener("click", limparFormulario);

document.addEventListener("DOMContentLoaded", listarContatos());
