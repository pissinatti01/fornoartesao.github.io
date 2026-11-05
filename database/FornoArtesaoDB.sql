-- =========================================================================
-- BANCO DE DADOS: FORNO ARTESÃO - PADARIA & CONFEITARIA ARTESANAL
-- Sistema Integrado: Catálogo, Pedidos Online (Checkout), Clientes, 
-- Estoque de Insumos, Fichas Técnicas e Fluxo de Caixa.
-- Modelado nas Formas Normais (1FN, 2FN e 3FN)
-- =========================================================================

DROP DATABASE IF EXISTS FornoArtesaoDB;
CREATE DATABASE FornoArtesaoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE FornoArtesaoDB;

-- =========================================================================
-- 1. CADASTRO DE CLIENTES E ENDEREÇOS (1FN e 2FN)
-- =========================================================================

-- Dados cadastrais do cliente
CREATE TABLE Cliente (
  idCliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomeCompleto VARCHAR(120) NOT NULL,
  telefoneWhatsapp VARCHAR(20) NOT NULL UNIQUE,
  dataCadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Endereços estruturados dos clientes (1FN: atributos atômicos; 1:N cliente -> endereços)
CREATE TABLE EnderecoCliente (
  idEndereco INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idCliente INT UNSIGNED NOT NULL,
  cep CHAR(9) NOT NULL,
  logradouro VARCHAR(150) NOT NULL,
  numero VARCHAR(15) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  cidade VARCHAR(80) NOT NULL DEFAULT 'Parnamirim',
  uf CHAR(2) NOT NULL DEFAULT 'RN',
  complemento VARCHAR(100) NULL,
  pontoReferencia VARCHAR(150) NULL,
  
  CONSTRAINT fk_endereco_cliente 
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 2. CATÁLOGO DE PRODUTOS E CATEGORIAS (3FN)
-- =========================================================================

-- Categorias do cardápio
CREATE TABLE Categoria (
  idCategoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomeCategoria VARCHAR(60) NOT NULL UNIQUE,
  slug VARCHAR(60) NOT NULL UNIQUE,
  icone VARCHAR(10) NULL,
  ativa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Catálogo de produtos artesanais
CREATE TABLE Produto (
  idProduto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idCategoria INT UNSIGNED NOT NULL,
  codigoIdentificador VARCHAR(60) NOT NULL UNIQUE,
  nomeProduto VARCHAR(120) NOT NULL,
  descricao TEXT NOT NULL,
  ingredientes TEXT NOT NULL,
  pesoPorcao VARCHAR(50) NOT NULL,
  precoBase DECIMAL(10,2) NOT NULL,
  imagemUrl VARCHAR(255) NOT NULL,
  badgeDestaque VARCHAR(50) NULL,
  isGoldBadge BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  
  CONSTRAINT fk_produto_categoria 
    FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 3. GESTÃO DE PEDIDOS E CHECKOUT MULTI-ETAPAS
-- =========================================================================

-- Cabeçalho do pedido (espelha as etapas de confirmação, entrega e pagamento do site)
CREATE TABLE Pedido (
  idPedido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idCliente INT UNSIGNED NOT NULL,
  idEnderecoEntrega INT UNSIGNED NULL, -- NULL caso seja 'Retirada'
  tipoEntrega ENUM('Delivery', 'Retirada') NOT NULL DEFAULT 'Delivery',
  taxaEntrega DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  subtotalProdutos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valorTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  formaPagamento ENUM('PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Dinheiro') NOT NULL,
  trocoPara VARCHAR(50) NULL, -- Ex: 'R$ 50,00' ou 'Não precisa'
  statusPedido ENUM('Pendente', 'Confirmado', 'Em Produção', 'Saiu para Entrega', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Pendente',
  observacoes TEXT NULL,
  dataHoraPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pedido_cliente 
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT fk_pedido_endereco 
    FOREIGN KEY (idEnderecoEntrega) REFERENCES EnderecoCliente(idEndereco) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Itens que compõem o pedido (2FN: histórico de preço praticado imutável)
CREATE TABLE ItemPedido (
  idPedido INT UNSIGNED NOT NULL,
  idProduto INT UNSIGNED NOT NULL,
  quantidade INT UNSIGNED NOT NULL DEFAULT 1,
  precoUnitarioPraticado DECIMAL(10,2) NOT NULL,
  subtotalItem DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * precoUnitarioPraticado) STORED,
  
  PRIMARY KEY (idPedido, idProduto),
  
  CONSTRAINT fk_item_pedido 
    FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido) 
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT fk_item_produto 
    FOREIGN KEY (idProduto) REFERENCES Produto(idProduto) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 4. CONTROLE DE ESTOQUE, INSUMOS E FICHAS TÉCNICAS
-- =========================================================================

-- Matérias-primas e insumos de confeitaria/panificação
CREATE TABLE Insumo (
  idInsumo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomeInsumo VARCHAR(100) NOT NULL,
  unidadeMedida ENUM('kg', 'g', 'litro', 'ml', 'unidade', 'pacote') NOT NULL,
  estoqueAtual DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  estoqueMinimo DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  custoUnitarioMedio DECIMAL(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

-- Ficha Técnica: Relaciona cada Produto aos Insumos necessários para sua receita
CREATE TABLE FichaTecnica (
  idProduto INT UNSIGNED NOT NULL,
  idInsumo INT UNSIGNED NOT NULL,
  quantidadeNecessaria DECIMAL(10,3) NOT NULL,
  
  PRIMARY KEY (idProduto, idInsumo),
  
  CONSTRAINT fk_ficha_produto 
    FOREIGN KEY (idProduto) REFERENCES Produto(idProduto) 
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT fk_ficha_insumo 
    FOREIGN KEY (idInsumo) REFERENCES Insumo(idInsumo) 
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- 5. FLUXO DE CAIXA E CONTROLE DE DESPESAS OPERACIONAIS
-- =========================================================================

-- Despesas fixas e variáveis (Energia, Gás, Embalagens, Água, etc.)
CREATE TABLE Despesa (
  idDespesa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoriaDespesa ENUM('Insumos', 'Embalagens', 'Energia Elétrica', 'Água', 'Gás', 'Manutenção', 'Marketing', 'Outros') NOT NULL,
  descricao VARCHAR(120) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  dataVencimento DATE NOT NULL,
  dataPagamento DATE NULL,
  statusPagamento ENUM('Pendente', 'Pago', 'Cancelado') NOT NULL DEFAULT 'Pendente'
) ENGINE=InnoDB;

-- =========================================================================
-- 6. POVOAMENTO INICIAL (DADOS REAIS DO SITE FORNO ARTESÃO)
-- =========================================================================

-- Categorias do Site
INSERT INTO Categoria (idCategoria, nomeCategoria, slug, icone, ativa) VALUES
(1, 'Doces & Casadinhos', 'doces', '🥟', TRUE),
(2, 'Bolos Artesanais', 'bolos', '🍎', TRUE),
(3, 'Biscoitos Salgados', 'biscoitos', '🧀', TRUE);

-- Produtos Reais do Catálogo Oficial
INSERT INTO Produto (idProduto, idCategoria, codigoIdentificador, nomeProduto, descricao, ingredientes, pesoPorcao, precoBase, imagemUrl, badgeDestaque, isGoldBadge, ativo) VALUES
(1, 2, 'bolo-chocolate-artesanal', 'Bolo Artesanal com Calda de Chocolate Nobre', 
 'Massa amanteigada fofinha e dourada, assada lentamente no forno e banhada com calda cremosa e brilhante de chocolate nobre.', 
 'Chocolate meio amargo nobre, cacau 70%, manteiga de primeira linha, farinha de trigo especial, ovos caipiras e leite integral.', 
 'Bolo Inteiro', 48.00, 'assets/images/bolo-chocolate-artesanal.jpg', 'Novo no Forno', TRUE, TRUE),

(2, 1, 'casadinhos-coloridos', 'Casadinhos Recheados com Confeitos', 
 'Disquinhos amanteigados que desmancham na boca, recheados com doce artesanal cremoso e bordas de confeitos coloridos crocantes.', 
 'Farinha de trigo selecionada, manteiga pura, doce de leite artesanal, confeitos crocantes e essência natural de baunilha.', 
 'Pote Artesanal 250g', 19.50, 'assets/images/casadinhos-coloridos.jpg', 'Favorito Festivo', TRUE, TRUE),

(3, 1, 'bolinhas-nevadas-goiabada', 'Bolinhas Nevadas de Goiabada Cremosa', 
 'Esferas amanteigadas com recheio suave de goiabada cascão cremosa, passadas delicadamente no açúcar de confeiteiro nevado.', 
 'Goiabada cascão artesanal, manteiga fresca sem sal, amido selecionado e açúcar de confeiteiro impalpável.', 
 'Pote Artesanal 250g', 18.00, 'assets/images/bolinhas-nevadas-goiabada.jpg', 'Derrete na Boca', FALSE, TRUE),

(4, 1, 'coracoes-amanteigados', 'Corações Amanteigados Recheados', 
 'Biscoitinhos em formato de coração com acabamento cristalizado e massa aveludada, recheados com creme suave.', 
 'Massa fina amanteigada, extrato suave de frutas vermelhas, recheio artesanal especial e açúcar cristal fino.', 
 'Pote Artesanal 250g', 20.00, 'assets/images/coracoes-amanteigados.jpg', 'Edição Especial', TRUE, TRUE),

(5, 2, 'bolo-maca-canela', 'Bolo Artesanal de Maçã e Canela', 
 'Massa fofinha e aromática, preparada com especiarias e coberta com fatias generosas de maçã caramelizada no forno artesanal.', 
 'Maçãs frescas selecionadas, canela do ceilão, açúcar mascavo, farinha de trigo enriquecida e noz-moscada.', 
 'Bolo Inteiro', 46.00, 'assets/images/bolo-maca-canela.jpg', 'Destaque da Casa', TRUE, TRUE),

(6, 1, 'pasteis-doces', 'Pastéis Doces Finos Artesanais', 
 'Massa finíssima, delicada e crocante, recheio artesanal suave e generosamente polvilhado com açúcar fino.', 
 'Farinha de trigo especial, manteiga pura, açúcar de confeiteiro, ovos caipiras e recheio tradicional da casa.', 
 'Pacote 250g', 18.50, 'assets/images/pasteis-doces.jpg', 'Receita Tradicional', FALSE, TRUE),

(7, 3, 'biscoitos-queijo', 'Biscoitos Amanteigados de Queijo', 
 'Biscoitinhos dourados, salgadinhos na medida perfeita, com aroma inconfundível de queijo curado assado na hora.', 
 'Manteiga de primeira linha, queijo curado selecionado, polvilho doce e flor de sal.', 
 'Pacote 200g', 16.00, 'assets/images/biscoitos-queijo.jpg', 'Mais Vendido', FALSE, TRUE),

(8, 1, 'broinhas-amanteigadas', 'Biscoitos com Doce de Leite & Sucrilhos', 
 'Biscoitinhos amanteigados dourados e crocantes, recheados com doce de leite cremoso artesanal e pedacinhos estaladiços de sucrilhos.', 
 'Farinha de trigo especial, manteiga pura, doce de leite cremoso da casa, flocos crocantes de sucrilhos de milho e ovos caipiras.', 
 'Pacote 250g', 15.00, 'assets/images/broinhas-amanteigadas.jpg', 'Doce de Leite & Sucrilhos', TRUE, TRUE);

-- Clientes de Exemplo
INSERT INTO Cliente (idCliente, nomeCompleto, telefoneWhatsapp, dataCadastro) VALUES
(1, 'Dona Joilma Varela', '8491436368', '2026-10-01 08:30:00'),
(2, 'Maria Clara Albuquerque', '84994551122', '2026-10-15 14:20:00'),
(3, 'Lucas Medeiros Costa', '84988773344', '2026-11-01 10:15:00');

-- Endereços dos Clientes
INSERT INTO EnderecoCliente (idEndereco, idCliente, cep, logradouro, numero, bairro, cidade, uf, complemento, pontoReferencia) VALUES
(1, 2, '59152-600', 'Av. Maria Lacerda Montenegro', '1200', 'Nova Parnamirim', 'Parnamirim', 'RN', 'Apto 402, Bloco C', 'Próximo ao Salesiano'),
(2, 3, '59151-250', 'Rua Carmem Miranda', '88', 'Nova Parnamirim', 'Parnamirim', 'RN', 'Casa', 'Em frente à praça');

-- Insumos Básicos da Confeitaria/Panificação
INSERT INTO Insumo (idInsumo, nomeInsumo, unidadeMedida, estoqueAtual, estoqueMinimo, custoUnitarioMedio) VALUES
(1, 'Farinha de Trigo Especial', 'kg', 50.000, 15.000, 4.50),
(2, 'Manteiga Pura Primeira Linha', 'kg', 25.000, 8.000, 32.00),
(3, 'Açúcar de Confeiteiro Impalpável', 'kg', 18.000, 5.000, 6.80),
(4, 'Goiabada Cascão Artesanal', 'kg', 12.000, 4.000, 22.00),
(5, 'Doce de Leite Cremoso', 'kg', 15.000, 5.000, 26.00),
(6, 'Chocolate Meio Amargo Nobre 70%', 'kg', 10.000, 3.000, 48.00),
(7, 'Maçã Fuji Fresca', 'kg', 14.000, 5.000, 8.50),
(8, 'Queijo Curado Artesanal', 'kg', 8.500, 3.000, 42.00),
(9, 'Embalagem Pote Pet 250g com Tampa', 'unidade', 150.000, 40.000, 1.20),
(10, 'Embalagem Pacote Zip Kraft', 'unidade', 180.000, 50.000, 0.95);

-- Fichas Técnicas Exemplares (Proporção de insumos por produto)
INSERT INTO FichaTecnica (idProduto, idInsumo, quantidadeNecessaria) VALUES
(1, 1, 0.350), -- Bolo Chocolate: 350g farinha
(1, 2, 0.180), -- 180g manteiga
(1, 6, 0.250), -- 250g chocolate nobre
(3, 1, 0.120), -- Bolinhas Nevadas: 120g farinha
(3, 2, 0.080), -- 80g manteiga
(3, 3, 0.050), -- 50g açúcar confeiteiro
(3, 4, 0.100), -- 100g goiabada
(3, 9, 1.000), -- 1 pote pet
(5, 1, 0.300), -- Bolo Maçã: 300g farinha
(5, 2, 0.150), -- 150g manteiga
(5, 7, 0.400); -- 400g maçã

-- Registro de Despesas Operacionais
INSERT INTO Despesa (idDespesa, categoriaDespesa, descricao, valor, dataVencimento, dataPagamento, statusPagamento) VALUES
(1, 'Energia Elétrica', 'Cosern - Energia do Forno e Climatização', 320.00, '2026-11-10', '2026-11-04', 'Pago'),
(2, 'Gás', 'Botijões P45 para Fornada Contínua', 280.00, '2026-11-12', '2026-11-04', 'Pago'),
(3, 'Embalagens', 'Lote de Potes Herméticos e Sacolas Kraft', 215.00, '2026-11-15', NULL, 'Pendente'),
(4, 'Água', 'Caern - Abastecimento e Higienização', 85.00, '2026-11-18', NULL, 'Pendente');

-- Pedidos de Teste (Simulando o fluxo real do carrinho do site)
-- Pedido 1: Maria Clara pede Bolo de Chocolate + Casadinhos (Delivery / PIX)
INSERT INTO Pedido (idPedido, idCliente, idEnderecoEntrega, tipoEntrega, taxaEntrega, subtotalProdutos, valorTotal, formaPagamento, trocoPara, statusPedido, observacoes, dataHoraPedido) VALUES
(101, 2, 1, 'Delivery', 7.00, 67.50, 74.50, 'PIX', NULL, 'Em Produção', 'Por favor, enviar com laço para presente.', '2026-11-05 09:30:00');

INSERT INTO ItemPedido (idPedido, idProduto, quantidade, precoUnitarioPraticado) VALUES
(101, 1, 1, 48.00), -- 1x Bolo de Chocolate
(101, 2, 1, 19.50); -- 1x Casadinhos Coloridos

-- Pedido 2: Lucas Medeiros pede Bolinhas Nevadas + Biscoito Queijo (Delivery / Dinheiro com troco)
INSERT INTO Pedido (idPedido, idCliente, idEnderecoEntrega, tipoEntrega, taxaEntrega, subtotalProdutos, valorTotal, formaPagamento, trocoPara, statusPedido, observacoes, dataHoraPedido) VALUES
(102, 3, 2, 'Delivery', 7.00, 34.00, 41.00, 'Dinheiro', 'Troco para R$ 50,00', 'Confirmado', 'Entregar bem quentinho.', '2026-11-05 11:15:00');

INSERT INTO ItemPedido (idPedido, idProduto, quantidade, precoUnitarioPraticado) VALUES
(102, 3, 1, 18.00), -- 1x Bolinhas Nevadas
(102, 7, 1, 16.00); -- 1x Biscoitos de Queijo

-- Pedido 3: Pedido com 2x Bolo de Maçã e Canela (Frete Grátis por passar de R$ 65,00)
INSERT INTO Pedido (idPedido, idCliente, idEnderecoEntrega, tipoEntrega, taxaEntrega, subtotalProdutos, valorTotal, formaPagamento, trocoPara, statusPedido, observacoes, dataHoraPedido) VALUES
(103, 2, 1, 'Delivery', 0.00, 92.00, 92.00, 'Cartão de Crédito', NULL, 'Pendente', 'Caprichar na canela!', '2026-11-05 14:00:00');

INSERT INTO ItemPedido (idPedido, idProduto, quantidade, precoUnitarioPraticado) VALUES
(103, 5, 2, 46.00); -- 2x Bolo de Maçã e Canela

-- =========================================================================
-- 7. CONSULTAS E VIEWS ESSENCIAIS PARA A OPERAÇÃO
-- =========================================================================

-- View 1: Painel de Pedidos para a Cozinha e Embalagem (Fornadas)
CREATE OR REPLACE VIEW vw_pedidos_cozinha AS
SELECT 
  p.idPedido AS 'Pedido_ID',
  p.dataHoraPedido AS 'Hora_Pedido',
  c.nomeCompleto AS 'Cliente',
  c.telefoneWhatsapp AS 'WhatsApp',
  p.tipoEntrega AS 'Envio',
  pr.nomeProduto AS 'Produto',
  ip.quantidade AS 'Qtd',
  pr.pesoPorcao AS 'Embalagem',
  p.observacoes AS 'Observacoes',
  p.statusPedido AS 'Status'
FROM Pedido p
INNER JOIN Cliente c ON p.idCliente = c.idCliente
INNER JOIN ItemPedido ip ON p.idPedido = ip.idPedido
INNER JOIN Produto pr ON ip.idProduto = pr.idProduto
WHERE p.statusPedido IN ('Pendente', 'Confirmado', 'Em Produção')
ORDER BY p.dataHoraPedido ASC;

-- View 2: Relatório de Despacho & Entrega com Endereço Completo
CREATE OR REPLACE VIEW vw_despacho_entregas AS
SELECT 
  p.idPedido AS 'Pedido_ID',
  c.nomeCompleto AS 'Cliente',
  c.telefoneWhatsapp AS 'Telefone',
  CONCAT(e.logradouro, ', Nº ', e.numero, ' - ', e.bairro, ' (', e.cidade, '/', e.uf, ') CEP: ', e.cep, 
         IF(e.complemento IS NOT NULL, CONCAT(' [', e.complemento, ']'), '')) AS 'Endereco_Completo',
  p.formaPagamento AS 'Forma_Pagamento',
  p.trocoPara AS 'Troco_Necessario',
  p.valorTotal AS 'Valor_Receber',
  p.statusPedido AS 'Status'
FROM Pedido p
INNER JOIN Cliente c ON p.idCliente = c.idCliente
LEFT JOIN EnderecoCliente e ON p.idEnderecoEntrega = e.idEndereco
WHERE p.tipoEntrega = 'Delivery';

-- View 3: Alerta de Insumos com Estoque Baixo (Ponto de Reposição)
CREATE OR REPLACE VIEW vw_alerta_estoque_baixo AS
SELECT 
  nomeInsumo AS 'Insumo',
  estoqueAtual AS 'Estoque_Atual',
  estoqueMinimo AS 'Estoque_Minimo',
  unidadeMedida AS 'Unidade',
  ROUND((estoqueAtual / estoqueMinimo) * 100, 1) AS 'Percentual_Nivel'
FROM Insumo
WHERE estoqueAtual <= estoqueMinimo;

-- View 4: Balanço Financeiro Geral (Faturamento Bruto vs Despesas)
CREATE OR REPLACE VIEW vw_balanco_financeiro AS
SELECT 
  (SELECT IFNULL(SUM(valorTotal), 0) FROM Pedido WHERE statusPedido != 'Cancelado') AS 'Faturamento_Bruto',
  (SELECT IFNULL(SUM(valor), 0) FROM Despesa WHERE statusPagamento = 'Pago') AS 'Despesas_Pagas',
  (SELECT IFNULL(SUM(valor), 0) FROM Despesa WHERE statusPagamento = 'Pendente') AS 'Despesas_Pendentes',
  ((SELECT IFNULL(SUM(valorTotal), 0) FROM Pedido WHERE statusPedido != 'Cancelado') - 
   (SELECT IFNULL(SUM(valor), 0) FROM Despesa WHERE statusPagamento = 'Pago')) AS 'Saldo_Operacional';
