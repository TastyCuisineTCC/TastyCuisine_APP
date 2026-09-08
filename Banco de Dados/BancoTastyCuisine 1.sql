CREATE DATABASE TASTYCUISINE
GO
USE TASTYCUISINE
GO

CREATE TABLE Usuario (
    Cod_user INT IDENTITY(1,1) PRIMARY KEY,
    Nome_completo NVARCHAR(300) NOT NULL,
    Idade DATE NOT NULL,
    Gmail NVARCHAR(255) NOT NULL UNIQUE,
    Senha NVARCHAR(250) NOT NULL,
    Status_Usuario NVARCHAR(20) NOT NULL default 'ATIVO',
    Bloqueado BIT NOT NULL Default 0,
    Restricoes_alimentares NVARCHAR(MAX) default 'lactose' NULL,
    foto_perfil NVARCHAR(MAX) NULL,
    funcao NVARCHAR(30) NOT NULL, -- Chefe ou Usuario,

    CONSTRAINT CHK_idade CHECK (DATEADD(year, 14, Idade) <= GETDATE()) -- ve se o caba tem mais de 14 anos
);

CREATE TABLE Categorias (
    Cod_Categoria INT IDENTITY(1,1) PRIMARY KEY,
    Nome_Categoria NVARCHAR(100) NOT NULL,
    Grupo NVARCHAR(30) NOT NULL DEFAULT 'neutro'
);

CREATE TABLE Receitas (
    Cod_receitas INT IDENTITY(1,1) PRIMARY KEY,
    Nome_receita NVARCHAR(250) NOT NULL,
    Descricao NVARCHAR(250) NOT NULL,
    Modo_preparo NVARCHAR(MAX) NOT NULL,
    Ingredientes NVARCHAR(MAX) NOT NULL,
    Cod_usuario INT NOT NULL,
    Foto_receita NVARCHAR(MAX),
    Restricao INT NOT NULL,
    Status_Receita NVARCHAR(20) NOT NULL default 'INATIVO',
    TempoPreparo NVARCHAR(20) NOT NULL,
    FOREIGN KEY (Cod_usuario) REFERENCES Usuario(Cod_user),
    CONSTRAINT chk_ingredientes CHECK (Ingredientes IS NULL OR ISJSON(Ingredientes) = 1),
    CONSTRAINT chk_modo_preparo CHECK (ISJSON(Modo_preparo) = 1)
);

CREATE TABLE Favoritos (
    Cod_favoritos BIGINT IDENTITY(1,1) PRIMARY KEY,
    Cod_user INT NOT NULL,
    Cod_receitas INT NOT NULL,
    FOREIGN KEY (Cod_user) REFERENCES Usuario(Cod_user),
    FOREIGN KEY (Cod_receitas) REFERENCES Receitas(Cod_receitas),
    CONSTRAINT unique_usuario_receita UNIQUE (Cod_user,Cod_receitas)
)

CREATE TABLE Comentarios (
    Cod_comentarios BIGINT IDENTITY(1,1) PRIMARY KEY,
    Cod_user INT NOT NULL,
    Cod_receitas INT NOT NULL,
    Nota INT NOT NULL CHECK (Nota BETWEEN 1 AND 5),
    Data_Comentario DATETIME DEFAULT GETDATE(),
    Status_Comentarios NVARCHAR(20) NOT NULL default 'ATIVO',
    FOREIGN KEY (Cod_user) REFERENCES Usuario(Cod_user),
    FOREIGN KEY (Cod_receitas) REFERENCES Receitas(Cod_receitas)
);

CREATE TABLE Livros(
    Cod_Livros INT IDENTITY(1,1) PRIMARY KEY,
    Nome_Livro NVARCHAR(50) NOT NULL,
    Foto_Livro NVARCHAR(MAX) NULL,
    Cod_User INT NOT NULL,
       
    FOREIGN KEY (Cod_User) REFERENCES Usuario(Cod_user),
);

CREATE TABLE Livro_Receitas(
    Cod_Livros INT NOT NULL,
    Cod_Receita INT NOT NULL
)

CREATE TABLE Receitas_Categorias(
    Cod_Categoria INT NOT NULL,
    Cod_Receita INT NOT NULL
    FOREIGN KEY (Cod_receita)   REFERENCES Receitas(Cod_receitas),
    FOREIGN KEY (Cod_Categoria) REFERENCES Categorias(Cod_Categoria)
)

CREATE TABLE Notificacoes (
    Cod_notificacao BIGINT IDENTITY(1,1) PRIMARY KEY,
    Cod_user INT NULL,                -- Usuário/Chefe afetado
    Cod_receita INT NULL,             -- Receita afetada (se for o caso)
    Tipo_Entidade NVARCHAR(20) NOT NULL, -- 'USUARIO', 'CHEFE' ou 'RECEITA'
    Motivo NVARCHAR(100) NOT NULL,     -- Pré-pronto ou o valor do "Outro"
    Descricao NVARCHAR(MAX) NOT NULL,  -- Explicação do Admin
    Resposta_Usuario NVARCHAR(MAX) NULL, -- Contestação do Usuário
    Data_Envio DATETIME DEFAULT GETDATE(),
    Status_Notificacao NVARCHAR(20) DEFAULT 'PENDENTE', -- 'PENDENTE', 'EM_ANALISE', 'RESOLVIDO'
    
    FOREIGN KEY (Cod_user) REFERENCES Usuario(Cod_user),
    FOREIGN KEY (Cod_receita) REFERENCES Receitas(Cod_receitas)
);

GO
INSERT INTO Categorias (Nome_Categoria, Grupo) VALUES 
  ('Massas', 'neutro'),
  ('Sobremesas', 'neutro'),
  ('Lanches e Petiscos', 'neutro'),
  ('Sopas e Caldos', 'neutro'),
  ('Saladas', 'vegetariano'),
  ('Carnes', 'carnes'),
  ('Aves', 'carnes'),
  ('Peixes e Frutos do Mar', 'carnes'),
  ('Vegetariana', 'vegetariano'),
  ('Vegana', 'vegano'),
  ('Bebidas e Drinks', 'neutro'),
  ('Caf� da Manh�', 'neutro'),
  ('P�es e Bolos', 'neutro'),
  ('Fitness e Saud�vel', 'neutro'),
  ('Molhos e Acompanhamentos', 'neutro');


insert into Usuario(Nome_completo,Idade,Gmail,Senha,Restricoes_alimentares,funcao)
VALUES('eu','2000/08/20','gmail@gmail.com','123456','[]','Usuario')

--#region Inserção de Receitas.
INSERT INTO receitas (
    Nome_receita, 
    Descricao, 
    Modo_preparo, 
    Ingredientes, 
    Cod_usuario, 
    Foto_receita, 
    Restricao, 
    Status_Receita,
    TempoPreparo) VALUES 
('Bolo de Cenoura', 'Cl�ssico bolo de cenoura fofinho com cobertura de chocolate.', 
 '["Bata as cenouras, ovos e �leo no liquidificador", "Misture a farinha e o a��car em uma tigela", "Junte as misturas e adicione o fermento", "Asse em forno preaquecido a 180�C por 40 min", "Fa�a a calda de chocolate e cubra o bolo"]', 
 '[{"nome": "Cenoura", "quantidade": "3", "unidade": "unidades"}, {"nome": "Ovo", "quantidade": "3", "unidade": "unidades"}, {"nome": "�leo", "quantidade": "1/2", "unidade": "x�cara"}, {"nome": "A��car", "quantidade": "2", "unidade": "x�caras"}, {"nome": "Farinha de Trigo", "quantidade": "2.5", "unidade": "x�caras"}, {"nome": "Fermento em p�", "quantidade": "1", "unidade": "colher de sopa"}]', 
 1, NULL, 15, 'ATIVO', 'Demorado'),

('Panqueca de Banana', 'Panqueca pr�tica de 2 ingredientes para o caf� da manh�.', 
 '["Amasse bem a banana em um prato", "Misture o ovo batido com a banana", "Aque�a uma frigideira antiaderente untada", "Pingue por��es da massa e doure dos dois lados"]', 
 '[{"nome": "Banana madura", "quantidade": "1", "unidade": "unidade"}, {"nome": "Ovo", "quantidade": "1", "unidade": "unidade"}, {"nome": "Canela em p�", "quantidade": "1", "unidade": "pitada"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Omelete de Queijo e Tomate', 'Omelete cremosa ideal para uma refei��o r�pida.', 
 '["Bata os ovos com sal e pimenta em uma tigela", "Despeje na frigideira aquecida em fogo baixo", "Adicione o queijo e o tomate picados de um lado", "Dobre ao meio e espere o queijo derreter"]', 
 '[{"nome": "Ovo", "quantidade": "2", "unidade": "unidades"}, {"nome": "Queijo Mu�arela", "quantidade": "50", "unidade": "gramas"}, {"nome": "Tomate", "quantidade": "1/2", "unidade": "unidade"}, {"nome": "Sal", "quantidade": "1", "unidade": "pitada"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Salada Ceasar Simples', 'Salada leve com molho caseiro e tiras de frango.', 
 '["Grelhe o peito de frango temperado e corte em tiras", "Lave e corte o alface-americana", "Misture a maionese com o lim�o e o queijo ralado para o molho", "Monte a salada juntando o alface, o frango, os croutons e o molho"]', 
 '[{"nome": "Alface-americana", "quantidade": "1", "unidade": "ma�o"}, {"nome": "Peito de Frango", "quantidade": "200", "unidade": "gramas"}, {"nome": "Croutons", "quantidade": "50", "unidade": "gramas"}, {"nome": "Queijo Parmes�o", "quantidade": "30", "unidade": "gramas"}]', 
 1, NULL, 15, 'ATIVO', 'Mediano'),

('Sopa de Legumes', 'Sopa reconfortante de legumes variados.', 
 '["Descasque e corte todos os legumes em cubos pequenos", "Refogue a cebola e o alho em uma panela grande", "Adicione os legumes e cubra com �gua", "Cozinhe at� ficarem macios e ajuste o sal"]', 
 '[{"nome": "Batata", "quantidade": "2", "unidade": "unidades"}, {"nome": "Cenoura", "quantidade": "1", "unidade": "unidade"}, {"nome": "Chuchu", "quantidade": "1", "unidade": "unidade"}, {"nome": "Cebola", "quantidade": "1/2", "unidade": "unidade"}]', 
 1, NULL, 15, 'ATIVO', 'Mediano'),

('Vitamina de Morango', 'Bebida r�pida e refrescante para a tarde.', 
 '["Lave bem os morangos e retire as folhas", "Adicione os morangos, o leite e o mel no liquidificador", "Bata por 2 minutos at� ficar homog�neo", "Sirva bem gelado"]', 
 '[{"nome": "Morango", "quantidade": "10", "unidade": "unidades"}, {"nome": "Leite", "quantidade": "250", "unidade": "ml"}, {"nome": "Mel", "quantidade": "1", "unidade": "colher de sopa"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Escondidinho de Carne Mo�da', 'Prato tradicional com pur� de batata e recheio suculento.', 
 '["Cozinhe as batatas e amasse-as fazendo um pur� leve", "Refogue a carne mo�da com alho, cebola e temperos a gosto", "Em um refrat�rio, fa�a uma camada de pur�, depois a carne e cubra com o restante do pur�", "Finalize com queijo ralado e leve ao forno para gratinar"]', 
 '[{"nome": "Carne Mo�da", "quantidade": "400", "unidade": "gramas"}, {"nome": "Batata", "quantidade": "6", "unidade": "unidades"}, {"nome": "Queijo Mu�arela", "quantidade": "100", "unidade": "gramas"}, {"nome": "Manteiga", "quantidade": "1", "unidade": "colher de sopa"}]', 
 1, NULL, 15, 'ATIVO', 'Demorado'),

('Macarr�o ao Alho e �leo', 'Massa r�pida e cheia de sabor com alho dourado.', 
 '["Cozinhe o macarr�o em �gua fervente com sal at� ficar al dente", "Em uma frigideira, doure o alho laminado no azeite", "Junte o macarr�o escorrido na frigideira e misture bem", "Polvilhe cheiro-verde picado antes de servir"]', 
 '[{"nome": "Macarr�o Spaghetti", "quantidade": "250", "unidade": "gramas"}, {"nome": "Alho", "quantidade": "4", "unidade": "dentes"}, {"nome": "Azeite de Oliva", "quantidade": "3", "unidade": "colheres de sopa"}, {"nome": "Sal", "quantidade": "1", "unidade": "colher de ch�"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Crepioca de Frango', 'Op��o saud�vel e proteica para o jantar.', 
 '["Bata a goma de tapioca com o ovo at� misturar bem", "Despeje em uma frigideira aquecida e cozinhe os dois lados", "Recheie com o frango desfiado temperado", "Dobre ao meio e sirva quente"]', 
 '[{"nome": "Goma de Tapioca", "quantidade": "2", "unidade": "colheres de sopa"}, {"nome": "Ovo", "quantidade": "1", "unidade": "unidade"}, {"nome": "Frango desfiado", "quantidade": "3", "unidade": "colheres de sopa"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Mousse de Maracuj�', 'Sobremesa cremosa com apenas 3 ingredientes.', 
 '["Bata o leite condensado, o creme de leite e o suco concentrado de maracuj� no liquidificador por 3 minutos", "Despeje em ta�as individuais ou em um refrat�rio", "Leve � geladeira por pelo menos 3 horas antes de servir"]', 
 '[{"nome": "Leite Condensado", "quantidade": "1", "unidade": "lata"}, {"nome": "Creme de Leite", "quantidade": "1", "unidade": "caixinha"}, {"nome": "Suco concentrado de maracuj�", "quantidade": "200", "unidade": "ml"}]', 
 1, NULL, 15, 'ATIVO', 'Mediano'),

('Guacamole Tradicional', 'Acompanhamento mexicano fresco e pr�tico.', 
 '["Amasse o abacate com um garfo deixando alguns peda�os", "Misture o tomate, a cebola e o coentro bem picados", "Tempere com o suco de lim�o, azeite e sal", "Misture delicadamente e sirva com tortillas"]', 
 '[{"nome": "Abacate", "quantidade": "1", "unidade": "unidade"}, {"nome": "Tomate", "quantidade": "1", "unidade": "unidade"}, {"nome": "Cebola Roxa", "quantidade": "1/2", "unidade": "unidade"}, {"nome": "Lim�o", "quantidade": "1", "unidade": "unidade"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Misto Quente de Frigideira', 'Lanche cl�ssico para qualquer hora do dia.', 
 '["Passe manteiga do lado de fora das fatias de p�o", "Monte o lanche com uma fatia de queijo e uma de presunto", "Coloque na frigideira aquecida em fogo baixo", "Vire quando estiver dourado e espere o queijo derreter"]', 
 '[{"nome": "P�o de Forma", "quantidade": "2", "unidade": "fatias"}, {"nome": "Queijo Mu�arela", "quantidade": "1", "unidade": "fatia"}, {"nome": "Presunto", "quantidade": "1", "unidade": "fatia"}, {"nome": "Manteiga", "quantidade": "1", "unidade": "colher de ch�"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Batata Saut�', 'Acompanhamento leve de batatas douradas na manteiga.', 
 '["Cozinhe as batatas cortadas em cubos grandes at� ficarem al dente", "Derreta a manteiga em uma frigideira larga", "Adicione as batatas escorridas e doure mexendo ocasionalmente", "Finalize com salsa picada e sal"]', 
 '[{"nome": "Batata", "quantidade": "4", "unidade": "unidades"}, {"nome": "Manteiga", "quantidade": "2", "unidade": "colheres de sopa"}, {"nome": "Salsinha", "quantidade": "1", "unidade": "colher de sopa"}, {"nome": "Sal", "quantidade": "1", "unidade": "pitada"}]', 
 1, NULL, 15, 'ATIVO', 'Mediano'),

('Smoothie de Banana e Cacau', 'Bebida cremosa perfeita para o pr�-treino.', 
 '["Descasque a banana e congele na v�spera", "Bata no liquidificador a banana congelada com o leite e o cacau", "Adicione a aveia e bata at� ficar cremoso", "Sirva imediatamente"]', 
 '[{"nome": "Banana", "quantidade": "1", "unidade": "unidade"}, {"nome": "Leite", "quantidade": "200", "unidade": "ml"}, {"nome": "Cacau em p� 100%", "quantidade": "1", "unidade": "colher de sopa"}, {"nome": "Aveia em flocos", "quantidade": "1", "unidade": "colher de sopa"}]', 
 1, NULL, 15, 'ATIVO', 'R�pido'),

('Arroz de Forno Cremoso', 'Receita para aproveitar o arroz do dia anterior.', 
 '["Misture o arroz cozido com o requeij�o e o milho", "Em um refrat�rio, alterne camadas de arroz, presunto e queijo", "Cubra a �ltima camada com queijo e polvilhe or�gano", "Leve ao forno a 200�C por 15 minutos at� gratinar"]', 
 '[{"nome": "Arroz cozido", "quantidade": "3", "unidade": "x�caras"}, {"nome": "Requeij�o Cremoso", "quantidade": "200", "unidade": "gramas"}, {"nome": "Milho verde", "quantidade": "1/2", "unidade": "lata"}, {"nome": "Queijo Mu�arela", "quantidade": "150", "unidade": "gramas"}]', 
 1, NULL, 15, 'ATIVO', 'Mediano');

-- Atualiza��o das URLs das fotos de cada receita no SQL Server


  -- Bolo de Cenoura
UPDATE Receitas SET Foto_receita = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb4toMJH3wDa2QU6jxj-ZTTxWabCZAdMfZprJQmS3jnA&s=10' WHERE Cod_receitas = 1;

  -- Panqueca de Banana
UPDATE Receitas SET Foto_receita = 'https://static.itdg.com.br/images/640-400/53e47bf452300d58b8e741ae370eae4f/365870-original.jpg' WHERE Cod_receitas = 2;

  -- Omelete de Queijo e Tomate
UPDATE Receitas SET Foto_receita = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjJZgy2aEqiAs_6xv4M6vc5QjsUVW8MIjHP2SaKhK-Jg&s=10' WHERE Cod_receitas = 3;

  -- Salada Caesar
UPDATE Receitas SET Foto_receita = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRBQcdJEg-uG0JnZAYtNXwIVZUMNczPBQZgy7SqYBXSg&s' WHERE Cod_receitas = 4;

  -- Sopa de Legumes
UPDATE Receitas SET Foto_receita = 'https://www.receitasnestle.com.br/sites/default/files/srh_recipes/855ad695b82075e4031b92cedc43a12d.jpg' WHERE Cod_receitas = 5;

  -- Vitamina de Morango
UPDATE Receitas SET Foto_receita = 'https://guiadacozinha.com.br/wp-content/uploads/2024/07/Vitamina-de-morango.jpg' WHERE Cod_receitas = 6;

  -- Escondidinho
UPDATE Receitas SET Foto_receita = 'https://www.receitasja.com.br/wp-content/uploads/2025/06/Escondidinho-de-carne-moida-com-mandioca-500x500.jpg' WHERE Cod_receitas = 7;

  -- Macarr�o ao Alho e �leo
UPDATE Receitas SET Foto_receita = 'https://static.itdg.com.br/images/1200-630/b738131b402ba33d58befa56415ba106/324571-original.jpg' WHERE Cod_receitas = 8;

  -- Crepioca de Frango
UPDATE Receitas SET Foto_receita = 'https://www.sadia.com.br/assets/images/_/recipes/6eccc5f88058bf142bab64f34639e3d63af6e3e5.webp' WHERE Cod_receitas = 9;

 -- Mousse de Maracuj�
UPDATE Receitas SET Foto_receita = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbRq24boqSmWDlEh9TDV4UCnZ5rfUKe34FetE3nLbhtC6CQS2xM2Nks53H&s=10' WHERE Cod_receitas = 10;

 -- Guacamole Tradicional
UPDATE Receitas SET Foto_receita = 'https://i.panelinha.com.br/i1/bk-6619-guacamole.webp' WHERE Cod_receitas = 11;

 -- Misto Quente
UPDATE Receitas SET Foto_receita = 'https://guiadacozinha.com.br/wp-content/uploads/2015/01/misto-quente-gratinado.jpg' WHERE Cod_receitas = 12;

 -- Batata Saut�
UPDATE Receitas SET Foto_receita = 'https://msabores.com/wp-content/uploads/2025/09/Batata-Saute-Dourada.webp' WHERE Cod_receitas = 13;

 -- Smoothie de Banana e Cacau
UPDATE Receitas SET Foto_receita = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnpj3BpHP-rICRh9Am19FZH2hbYci3cAc9G1fpMySNyreclj9AQdAg8kwm&s=10' WHERE Cod_receitas = 14;

 -- Arroz de Forno Cremoso
UPDATE Receitas SET Foto_receita = 'https://sabores-new.s3.amazonaws.com/public/2025/02/arroz-de-forno-cremoso.jpg' WHERE Cod_receitas = 15;
--#endregion

--#region Inserção Categorias ára as receitas.
 -- Associa��o das Receitas com suas Categoria(s) correspondentes
INSERT INTO Receitas_Categorias (Cod_Receita, Cod_Categoria) VALUES 
  (1, 2),  -- Bolo de Cenoura -> Sobremesas
  (1, 13), -- Bolo de Cenoura -> P�es e Bolos
  (2, 12), -- Panqueca de Banana -> Caf� da Manh�
  (2, 14), -- Panqueca de Banana -> Fitness e Saud�vel
  (3, 12), -- Omelete de Queijo e Tomate -> Caf� da Manh�
  (3, 14), -- Omelete de Queijo e Tomate -> Fitness e Saud�vel
  (4, 5),  -- Salada Ceasar Simples -> Saladas
  (4, 7),  -- Salada Ceasar Simples -> Aves
  (5, 4),  -- Sopa de Legumes -> Sopas e Caldos
  (5, 9),  -- Sopa de Legumes -> Vegetariana
  (6, 11), -- Vitamina de Morango -> Bebidas e Drinks
  (6, 12), -- Vitamina de Morango -> Caf� da Manh�
  (7, 6),  -- Escondidinho de Carne Mo�da -> Carnes
  (8, 1),  -- Macarr�o ao Alho e �leo -> Massas
  (9, 14), -- Crepioca de Frango -> Fitness e Saud�vel
  (9, 12), -- Crepioca de Frango -> Caf� da Manh�
  (10, 2), -- Mousse de Maracuj� -> Sobremesas
  (11, 3), -- Guacamole Tradicional -> Lanches e Petiscos
  (11, 15),-- Guacamole Tradicional -> Molhos e Acompanhamentos
  (11, 10),-- Guacamole Tradicional -> Vegana
  (12, 3), -- Misto Quente de Frigideira -> Lanches e Petiscos
  (13, 15),-- Batata Saut� -> Molhos e Acompanhamentos
  (13, 9), -- Batata Saut� -> Vegetariana
  (14, 11),-- Smoothie de Banana e Cacau -> Bebidas e Drinks
  (14, 14),-- Smoothie de Banana e Cacau -> Fitness e Saud�vel
  (15, 1); -- Arroz de Forno Cremoso -> Massas
--#endregion

--#region Inserção de Usuários Comuns (IDs 4 a 13)
INSERT INTO Usuario (Nome_completo, Idade, Gmail, Senha, Restricoes_alimentares, funcao) VALUES
('Carlos Eduardo', '1995/03/10', 'carlos@gmail.com', '123456', '[]', 'Usuario'),
('Mariana Silva', '1998/07/25', 'mariana@gmail.com', '123456', '[]', 'Usuario'),
('Lucas Mendes', '2001/11/12', 'lucas@gmail.com', '123456', '[]', 'Usuario'),
('Fernanda Costa', '1992/05/18', 'fernanda@gmail.com', '123456', '[]', 'Usuario'),
('Rafael Oliveira', '1990/09/01', 'rafael@gmail.com', '123456', '[]', 'Usuario'),
('Beatriz Lima', '2003/02/14', 'beatriz@gmail.com', '123456', '[]', 'Usuario'),
('Gabriel Santos', '1997/12/30', 'gabriel@gmail.com', '123456', '[]', 'Usuario'),
('Juliana Rocha', '1994/08/08', 'juliana@gmail.com', '123456', '[]', 'Usuario'),
('Thiago Martins', '1989/04/05', 'thiago@gmail.com', '123456', '[]', 'Usuario'),
('Camila Alves', '2000/10/20', 'camila@gmail.com', '123456', '[]', 'Usuario');
--#endregion

--#region Inserção de Avaliações nas Receitas (1 a 15)
INSERT INTO Comentarios (Cod_user, Cod_receitas, Nota, Status_Comentarios) VALUES
-- Receita 1: Bolo de Cenoura (5 avaliações)
(4, 1, 5, 'ATIVO'), (5, 1, 4, 'ATIVO'), (6, 1, 5, 'ATIVO'), (7, 1, 5, 'ATIVO'), (8, 1, 4, 'ATIVO'),

-- Receita 2: Panqueca de Banana (5 avaliações)
(4, 2, 4, 'ATIVO'), (6, 2, 3, 'ATIVO'), (8, 2, 5, 'ATIVO'), (10, 2, 4, 'ATIVO'), (12, 2, 5, 'ATIVO'),

-- Receita 3: Omelete de Queijo e Tomate (5 avaliações)
(5, 3, 5, 'ATIVO'), (7, 3, 4, 'ATIVO'), (9, 3, 4, 'ATIVO'), (11, 3, 3, 'ATIVO'), (13, 3, 5, 'ATIVO'),

-- Receita 4: Salada Ceasar Simples (5 avaliações)
(4, 4, 3, 'ATIVO'), (5, 4, 4, 'ATIVO'), (8, 4, 5, 'ATIVO'), (9, 4, 4, 'ATIVO'), (10, 4, 5, 'ATIVO'),

-- Receita 5: Sopa de Legumes (5 avaliações)
(6, 5, 4, 'ATIVO'), (7, 5, 5, 'ATIVO'), (11, 5, 4, 'ATIVO'), (12, 5, 3, 'ATIVO'), (13, 5, 4, 'ATIVO'),

-- Receita 6: Vitamina de Morango (5 avaliações)
(4, 6, 5, 'ATIVO'), (7, 6, 5, 'ATIVO'), (9, 6, 5, 'ATIVO'), (10, 6, 4, 'ATIVO'), (12, 6, 5, 'ATIVO'),

-- Receita 7: Escondidinho de Carne Moída (6 avaliações)
(5, 7, 5, 'ATIVO'), (6, 7, 5, 'ATIVO'), (8, 7, 4, 'ATIVO'), (9, 7, 5, 'ATIVO'), (11, 7, 5, 'ATIVO'), (13, 7, 4, 'ATIVO'),

-- Receita 8: Macarrão ao Alho e Óleo (5 avaliações)
(4, 8, 4, 'ATIVO'), (5, 8, 3, 'ATIVO'), (7, 8, 5, 'ATIVO'), (10, 8, 4, 'ATIVO'), (13, 8, 5, 'ATIVO'),

-- Receita 9: Crepioca de Frango (5 avaliações)
(6, 9, 5, 'ATIVO'), (8, 9, 4, 'ATIVO'), (9, 9, 4, 'ATIVO'), (11, 9, 5, 'ATIVO'), (12, 9, 4, 'ATIVO'),

-- Receita 10: Mousse de Maracujá (6 avaliações)
(4, 10, 5, 'ATIVO'), (5, 10, 5, 'ATIVO'), (7, 10, 5, 'ATIVO'), (8, 10, 4, 'ATIVO'), (10, 10, 5, 'ATIVO'), (12, 10, 5, 'ATIVO'),

-- Receita 11: Guacamole Tradicional (5 avaliações)
(6, 11, 4, 'ATIVO'), (9, 11, 5, 'ATIVO'), (11, 11, 3, 'ATIVO'), (12, 11, 4, 'ATIVO'), (13, 11, 5, 'ATIVO'),

-- Receita 12: Misto Quente de Frigideira (5 avaliações)
(4, 12, 3, 'ATIVO'), (5, 12, 4, 'ATIVO'), (7, 12, 4, 'ATIVO'), (8, 12, 5, 'ATIVO'), (10, 12, 4, 'ATIVO'),

-- Receita 13: Batata Sauté (5 avaliações)
(6, 13, 4, 'ATIVO'), (8, 13, 5, 'ATIVO'), (9, 13, 4, 'ATIVO'), (11, 13, 4, 'ATIVO'), (13, 13, 3, 'ATIVO'),

-- Receita 14: Smoothie de Banana e Cacau (5 avaliações)
(4, 14, 5, 'ATIVO'), (7, 14, 4, 'ATIVO'), (10, 14, 5, 'ATIVO'), (11, 14, 5, 'ATIVO'), (12, 14, 4, 'ATIVO'),

-- Receita 15: Arroz de Forno Cremoso (5 avaliações)
(5, 15, 4, 'ATIVO'), (6, 15, 5, 'ATIVO'), (8, 15, 4, 'ATIVO'), (9, 15, 5, 'ATIVO'), (13, 15, 4, 'ATIVO');
--#endregion
GO

insert into livros(Nome_Livro,Cod_User)
values('edurado',1)

insert into Livro_Receitas(Cod_Livros,Cod_Receita)
values(1,1)

insert into Receitas_Categorias(Cod_Categoria,Cod_Receita)
values(1,1)
GO
 
SELECT * FROM Usuario
Select * From Comentarios
select * from Categorias
select * from Receitas
select * from Favoritos
select * from Livros    
SELECT * FROM Livro_Receitas;
select * from Receitas_Categorias

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Livros';

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Receitas';

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Receitas';

SELECT *
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'Receitas_Categorias'
