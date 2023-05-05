// não altere!
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;

// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = 'desenvolvimento';

const serial = async (
    valoresLm35Temperatura,

) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // altere!
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'aluno',
                password: 'sptech',
                database: 'cerveja'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {
        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.');
    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        //console.log(data);
        const valores = data.split(';');
        const lm35Temperatura = parseFloat(valores[0]);

        valoresLm35Temperatura.push(lm35Temperatura);

        var maceracao = 1.22 * lm35Temperatura - 19.14;
        var malteracao_etp1 = 0.81 * lm35Temperatura + 2.23;
        var malteracao_etp2 = 2.04 * lm35Temperatura + 18.09;
        var malteracao_etp3 = 6.14 * lm35Temperatura - 80.71;
        var moagem = 4.09 * lm35Temperatura - 41.81;
        var brassagem_ept1 = 2.04 * lm35Temperatura - 16.9;
        var brassagem_ept2 = 6.14 * lm35Temperatura  - 100.71;
        var brassagem_ept3 = 2.04 * lm35Temperatura + 10.09;
        var fervura = 0.81 * lm35Temperatura + 79.23;
        var resfiramento_etp1 = 2.04 * lm35Temperatura - 44.9;
        var resfriamento_etp2 = 2.04 * lm35Temperatura - 39.9;
        var resfriamento_etp3 = 0.81 * lm35Temperatura - 16.76;
        var filtragem = 0.81 * lm35Temperatura - 20.76;
        var pausterizaçao = 4.09 * lm35Temperatura - 43.81;
        var produto_final = 2.04 * lm35Temperatura - 49.9;



        if (HABILITAR_OPERACAO_INSERIR) {
            if (AMBIENTE == 'producao') {
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> Importante! você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO temperatura (horario, maceracao, cozimento_1, cozimento_2, cozimento_3, moagem, brassagem_1, brassagem_2, brassagem_3, fervura, resfriamento_1, resfriamento_2, resfriamento_3, maturacao, pasteuriacao_rapida, tunel_pasteurizacao) VALUES (CURRENT_TIMESTAMP, ${maceracao},${malteracao_etp1},${malteracao_etp2},${malteracao_etp3},${moagem},${brassagem_ept1},${brassagem_ept2},${brassagem_ept3},${fervura},${resfiramento_etp1},${resfriamento_etp2},${resfriamento_etp3},${filtragem},${pausterizaçao},${produto_final},)`;

                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
                // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
                const connStr = "Server=servidor-acquatec.database.windows.net;Database=bd-acquatec;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";

                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                    console.log("valores inseridos no banco: ", maceracao + ", " + malteracao_etp1 + ", " + malteracao_etp2 + ", " + malteracao_etp3 + ", " + moagem + ", " + brassagem_ept1 + ", " + brassagem_ept2 + ", " + brassagem_ept3 + ", " + fervura + ", " + resfiramento_etp1 + ", " + resfriamento_etp2 + ", " + resfriamento_etp3 + ", " + filtragem + ", " + pausterizaçao + ", " + produto_final);
                }


                sql.connect(connStr)
                    .then(conn => inserirComando(conn, sqlquery))
                    .catch(err => console.log("erro! " + err));

            } else if (AMBIENTE == 'desenvolvimento') {

                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    'INSERT INTO temperatura (horario, maceracao, cozimento_1, cozimento_2, cozimento_3, moagem, brassagem_1, brassagem_2, brassagem_3, fervura, resfriamento_1, resfriamento_2, resfriamento_3, maturacao, pasteuriacao_rapida, tunel_pasteurizacao) VALUES (now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?)',
                    [maceracao, malteracao_etp1, malteracao_etp2, malteracao_etp3, moagem, brassagem_ept1, brassagem_ept2, brassagem_ept3, fervura, resfiramento_etp1, resfriamento_etp2, resfriamento_etp3, filtragem, pausterizaçao, produto_final]
                );
                console.log("valores inseridos no banco: ", maceracao + ", " + malteracao_etp1 + ", " + malteracao_etp2 + ", " + malteracao_etp3 + ", " + moagem + ", " + brassagem_ept1 + ", " + brassagem_ept2 + ", " + brassagem_ept3 + ", " + fervura + ", " + resfiramento_etp1 + ", " + resfriamento_etp2 + ", " + resfriamento_etp3 + ", " + filtragem + ", " + pausterizaçao + ", " + produto_final)

            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }
        }
    });
    arduino.on('error', (mensagem) => {
        console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
const servidor = (
    valoresLm35Temperatura,

) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
    app.listen(SERVIDOR_PORTA, () => {
        console.log(`API executada com sucesso na porta ${SERVIDOR_PORTA}`);
    });
    app.get('/sensores/lm35/temperatura', (_, response) => {
        return response.json(valoresLm35Temperatura);
    });

}

(async () => {
    const valoresLm35Temperatura = [];
    await serial(
        valoresLm35Temperatura
    );
    servidor(
        valoresLm35Temperatura
    );
})();
