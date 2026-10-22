# 🥖 Forno Artesão - Padaria, Biscoitos & Confeitaria Artesanal

Site oficial e catálogo online com carrinho e pedidos via WhatsApp da **Forno Artesão**.

🌐 **Acesse online:** [https://fornoartesao.github.io](https://fornoartesao.github.io) (ou através do seu domínio/subdomínio no GitHub Pages)

---

## 📁 Estrutura de Arquivos

O repositório está organizado para publicação direta e estática via **GitHub Pages**:

```text
fornoartesao.github.io/
├── index.html                 # Página inicial e estrutura principal do site
├── .nojekyll                  # Garante publicação estática direta no GitHub Pages
├── README.md                  # Documentação do repositório
└── assets/                    # Recursos do site
    ├── css/
    │   └── styles.css         # Folha de estilo completa e responsiva
    ├── js/
    │   └── app.js             # Lógica de catálogo, carrinho lateral e WhatsApp checkout
    ├── images/                # Imagens dos produtos, logo e banners
    │   ├── logo-circle.png
    │   ├── logo.png
    │   ├── padaria-hero.jpg
    │   ├── bolo-maca-canela.jpg
    │   ├── bolo-chocolate-artesanal.jpg
    │   ├── casadinhos-coloridos.jpg
    │   ├── bolinhas-nevadas-goiabada.jpg
    │   ├── coracoes-amanteigados.jpg
    │   ├── pasteis-doces.jpg
    │   ├── biscoitos-queijo.jpg
    │   ├── broinhas-amanteigadas.jpg
    │   ├── cafe-artesanal.jpg
    │   ├── croissant-frances.jpg
    │   ├── pao-de-queijo.jpg
    │   └── pao-fermentacao-natural.jpg
    ├── media/                 # Mídias e fotos adicionais arquivadas
    └── docs/                  # Documentos e encartes complementares
```

---

## 🚀 Como Funciona no GitHub Pages

1. **Raiz do Site:** O GitHub Pages serve automaticamente o arquivo `index.html` localizado na raiz.
2. **Carregamento dos Assets:** Todos os estilos, scripts e imagens utilizam caminhos relativos (`assets/...`), garantindo funcionamento tanto em `https://usuario.github.io/fornoartesao.github.io/` quanto em domínio próprio ou `fornoartesao.github.io`.
3. **Bypass Jekyll:** O arquivo `.nojekyll` desativa o processamento Jekyll do GitHub, permitindo carregamento mais rápido e sem restrições em nomes de pastas.
