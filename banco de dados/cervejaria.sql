CREATE DATABASE cerveja;

USE cerveja;

CREATE TABLE temperatura (
idTemp INT PRIMARY KEY auto_increment,
horario DATETIME default current_timestamp,
maceracao FLOAT,
cozimento_1 FLOAT,
cozimento_2 FLOAT,
cozimento_3 FLOAT,
moagem FLOAT,
brassagem_1 FLOAT,
brassagem_2 FLOAT,
brassagem_3 FLOAT,
fervura FLOAT,
resfriamento_1 FLOAT,
resfriamento_2 FLOAT,
resfriamento_3 FLOAT,
maturacao FLOAT,
pasteuriacao_rapida FLOAT,
tunel_pasteurizacao FLOAT
);

select * from temperatura;
