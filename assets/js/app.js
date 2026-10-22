/**
 * FORNO ARTESÃO - APLICAÇÃO WEB
 * Gerenciamento do Catálogo, Carrinho Lateral (Popup/Drawer) e Checkout WhatsApp
 */

// 1. Base de Dados de Produtos
const PRODUCTS = [
  {
    id: 'bolo-chocolate-artesanal',
    name: 'Bolo Artesanal com Calda de Chocolate Nobre',
    category: 'bolos',
    price: 48.00,
    weight: 'Bolo Inteiro (~1.3kg)',
    image: 'assets/images/bolo-chocolate-artesanal.jpg',
    badge: 'Novo no Forno',
    isGoldBadge: true,
    description: 'Massa amanteigada fofinha e dourada, assada lentamente no forno e banhada com calda cremosa e brilhante de chocolate nobre. Irresistível e reconfortante.',
    ingredients: 'Chocolate meio amargo nobre, cacau 70%, manteiga de primeira linha, farinha de trigo especial, ovos caipiras e leite integral.'
  },
  {
    id: 'casadinhos-coloridos',
    name: 'Casadinhos Recheados com Confeitos',
    category: 'doces',
    price: 19.50,
    weight: 'Pote Artesanal 250g',
    image: 'assets/images/casadinhos-coloridos.jpg',
    badge: 'Favorito Festivo',
    isGoldBadge: true,
    description: 'Disquinhos amanteigados que desmancham na boca, recheados com doce artesanal cremoso e bordas de confeitos coloridos crocantes. O clássico que alegra o dia.',
    ingredients: 'Farinha de trigo selecionada, manteiga pura, doce de leite artesanal, confeitos crocantes e essência natural de baunilha.'
  },
  {
    id: 'bolinhas-nevadas-goiabada',
    name: 'Bolinhas Nevadas de Goiabada Cremosa',
    category: 'doces',
    price: 18.00,
    weight: 'Pote Artesanal 250g',
    image: 'assets/images/bolinhas-nevadas-goiabada.jpg',
    badge: 'Derrete na Boca',
    isGoldBadge: false,
    description: 'Esferas amanteigadas com recheio suave de goiabada cascão cremosa, passadas delicadamente no açúcar de confeiteiro nevado. Textura aveludada incomparável.',
    ingredients: 'Goiabada cascão artesanal, manteiga fresca sem sal, amido selecionado e açúcar de confeiteiro impalpável.'
  },
  {
    id: 'coracoes-amanteigados',
    name: 'Corações Amanteigados Recheados',
    category: 'doces',
    price: 20.00,
    weight: 'Pote Artesanal 250g',
    image: 'assets/images/coracoes-amanteigados.jpg',
    badge: 'Edição Especial',
    isGoldBadge: true,
    description: 'Biscoitinhos em formato de coração com acabamento cristalizado e massa aveludada, recheados com creme suave. O presente perfeito para demonstrar carinho.',
    ingredients: 'Massa fina amanteigada, extrato suave de frutas vermelhas, recheio artesanal especial e açúcar cristal fino.'
  },
  {
    id: 'bolo-maca-canela',
    name: 'Bolo Artesanal de Maçã e Canela',
    category: 'bolos',
    price: 46.00,
    weight: 'Bolo Inteiro (~1.2kg)',
    image: 'assets/images/bolo-maca-canela.jpg',
    badge: 'Destaque da Casa',
    isGoldBadge: true,
    description: 'Massa fofinha e aromática, preparada com especiarias e coberta com fatias generosas de maçã caramelizada no forno artesanal. O aconchego em forma de bolo.',
    ingredients: 'Maçãs frescas selecionadas, canela do ceilão, açúcar mascavo, farinha de trigo enriquecida e noz-moscada.'
  },
  {
    id: 'pasteis-doces',
    name: 'Pastéis Doces Finos Artesanais',
    category: 'doces',
    price: 18.50,
    weight: 'Pacote 250g',
    image: 'assets/images/pasteis-doces.jpg',
    badge: 'Receita Tradicional',
    isGoldBadge: false,
    description: 'Massa finíssima, delicada e crocante, recheio artesanal suave e generosamente polvilhado com açúcar fino. Embalagem selada com fecho zip para manter o frescor.',
    ingredients: 'Farinha de trigo especial, manteiga pura, açúcar de confeiteiro, ovos caipiras e recheio tradicional da casa.'
  },
  {
    id: 'biscoitos-queijo',
    name: 'Biscoitos Amanteigados de Queijo',
    category: 'biscoitos',
    price: 16.00,
    weight: 'Pacote 200g',
    image: 'assets/images/biscoitos-queijo.jpg',
    badge: 'Mais Vendido',
    isGoldBadge: false,
    description: 'Biscoitinhos dourados, salgadinhos na medida perfeita, com aroma inconfundível de queijo curado assado na hora. O acompanhamento clássico para o café.',
    ingredients: 'Manteiga de primeira linha, queijo curado selecionado, polvilho doce e flor de sal.'
  },
  {
    id: 'broinhas-amanteigadas',
    name: 'Biscoitos com Doce de Leite & Sucrilhos',
    category: 'doces',
    price: 15.00,
    weight: 'Pacote 250g',
    image: 'assets/images/broinhas-amanteigadas.jpg',
    badge: 'Doce de Leite & Sucrilhos',
    isGoldBadge: true,
    description: 'Biscoitinhos amanteigados dourados e crocantes, recheados com doce de leite cremoso artesanal e pedacinhos estaladiços de sucrilhos. A união perfeita entre crocância e cremosidade!',
    ingredients: 'Farinha de trigo especial, manteiga pura, doce de leite cremoso da casa, flocos crocantes de sucrilhos de milho e ovos caipiras.'
  }
];

// 2. Estado Global do Carrinho
class CartState {
  constructor() {
    this.items = this.load();
    this.deliveryType = 'pickup'; // 'pickup' ou 'delivery'
    this.deliveryFee = 7.00;
    this.freeDeliveryThreshold = 65.00;
    this.orderNotes = '';
  }

  load() {
    try {
      const saved = localStorage.getItem('forno_artesao_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Erro ao carregar carrinho:', e);
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem('forno_artesao_cart', JSON.stringify(this.items));
    } catch (e) {
      console.warn('Erro ao salvar carrinho:', e);
    }
  }

  addItem(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        image: product.image,
        quantity: quantity
      });
    }

    this.save();
    this.notify();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    this.notify();
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.save();
      this.notify();
    }
  }

  clear() {
    this.items = [];
    this.save();
    this.notify();
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDeliveryFee() {
    if (this.deliveryType === 'pickup') return 0;
    const subtotal = this.getSubtotal();
    return subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryFee;
  }

  getTotal() {
    return this.getSubtotal() + this.getDeliveryFee();
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  setDeliveryType(type) {
    this.deliveryType = type;
    this.notify();
  }

  setOrderNotes(notes) {
    this.orderNotes = notes;
  }

  notify() {
    renderCart();
  }
}

const cart = new CartState();
window.cart = cart;
window.handleAddToCart = handleAddToCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.checkoutViaWhatsApp = checkoutViaWhatsApp;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;

// 3. Formatação Monetária (R$)
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// 4. Renderização do Catálogo de Produtos
function renderProducts(filter = 'todos', search = '') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const normalizedSearch = search.toLowerCase().trim();

  const filtered = PRODUCTS.filter(product => {
    const matchesCategory = filter === 'todos' || product.category === filter;
    const matchesSearch = !normalizedSearch || 
      product.name.toLowerCase().includes(normalizedSearch) || 
      product.description.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--brand-text-muted);">
        <p style="font-size: 1.2rem; font-family: var(--font-serif); margin-bottom: 0.5rem;">Nenhum produto encontrado</p>
        <p style="font-size: 0.9rem;">Tente buscar por outro termo ou explore as outras categorias acima.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-media" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="product-badge ${product.isGoldBadge ? 'gold' : ''}">${product.badge}</span>
        <button class="product-quick-view-btn" title="Visualizar detalhes" onclick="event.stopPropagation(); openQuickView('${product.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span class="product-category">${getCategoryName(product.category)}</span>
          <span class="product-weight">${product.weight}</span>
        </div>
        <h3 class="product-title" onclick="openQuickView('${product.id}')" style="cursor: pointer;">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <div class="product-price-box">
            <span class="product-price-label">Preço</span>
            <span class="product-price">${formatCurrency(product.price)}</span>
          </div>
          <button class="btn-add-cart" onclick="handleAddToCart('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function getCategoryName(categoryKey) {
  const map = {
    'doces': 'Doces & Casadinhos',
    'bolos': 'Bolos Artesanais',
    'biscoitos': 'Biscoitos Salgados'
  };
  return map[categoryKey] || 'Artesanal';
}

// 5. Renderização do Carrinho e Drawer Lateral
function renderCart() {
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalBadge = document.getElementById('cart-total-badge');
  const drawerCountEl = document.getElementById('drawer-count');
  const itemsContainer = document.getElementById('cart-items-container');
  const footerEl = document.getElementById('cart-drawer-footer');
  
  const count = cart.getCount();
  const subtotal = cart.getSubtotal();
  const deliveryFee = cart.getDeliveryFee();
  const total = cart.getTotal();

  // Atualiza Badge do Canto Superior Direito
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.classList.remove('bump');
    void cartCountEl.offsetWidth; // força re-flow
    cartCountEl.classList.add('bump');
  }

  if (cartTotalBadge) {
    cartTotalBadge.textContent = formatCurrency(subtotal);
  }

  if (drawerCountEl) {
    drawerCountEl.textContent = `${count} ${count === 1 ? 'item selecionado' : 'itens selecionados'}`;
  }

  // Se o carrinho estiver vazio
  if (cart.items.length === 0) {
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 class="cart-empty-title">Seu carrinho está vazio</h3>
          <p class="cart-empty-desc">Nenhum produto delicioso foi adicionado ainda. Escolha seus itens favoritos do nosso forno!</p>
          <button class="btn-start-shopping" onclick="closeCartDrawer(); document.getElementById('cardapio').scrollIntoView({ behavior: 'smooth' });">
            Explorar Cardápio do Forno
          </button>
        </div>
      `;
    }
    if (footerEl) {
      footerEl.style.display = 'none';
    }
    return;
  }

  // Se tiver itens
  if (footerEl) {
    footerEl.style.display = 'flex';
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">${item.weight}</div>
          <div class="cart-item-price-unit">${formatCurrency(item.price)} cada</div>
          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', -1)" title="Diminuir">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', 1)" title="Aumentar">+</button>
            </div>
          </div>
        </div>
        <div class="cart-item-right">
          <button class="cart-item-remove" onclick="cart.removeItem('${item.id}')" title="Remover item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <div class="cart-item-subtotal">${formatCurrency(item.price * item.quantity)}</div>
        </div>
      </div>
    `).join('');
  }

  // Sincroniza classes das opções de entrega
  const pickupBtn = document.getElementById('opt-pickup');
  const deliveryBtn = document.getElementById('opt-delivery');
  if (pickupBtn && deliveryBtn) {
    if (cart.deliveryType === 'pickup') {
      pickupBtn.classList.add('active');
      deliveryBtn.classList.remove('active');
    } else {
      deliveryBtn.classList.add('active');
      pickupBtn.classList.remove('active');
    }
  }

  // Atualiza totais no rodapé do drawer
  const subtotalEl = document.getElementById('drawer-subtotal');
  const deliveryEl = document.getElementById('drawer-delivery');
  const totalEl = document.getElementById('drawer-total');

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (deliveryEl) {
    if (cart.deliveryType === 'pickup') {
      deliveryEl.innerHTML = '<span class="summary-free-badge">Grátis (Retirada)</span>';
    } else if (subtotal >= cart.freeDeliveryThreshold) {
      deliveryEl.innerHTML = '<span class="summary-free-badge">Grátis (Promoção)</span>';
    } else {
      deliveryEl.textContent = formatCurrency(cart.deliveryFee);
    }
  }
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

// 6. Controle de Abertura / Fechamento do Drawer Lateral
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 7. Ação de Adicionar Produto com Toast e Abertura Lateral
function handleAddToCart(productId, quantity = 1) {
  cart.addItem(productId, quantity);
  const product = PRODUCTS.find(p => p.id === productId);
  showToast(`"${product ? product.name : 'Produto'}" adicionado ao carrinho!`);
  openCartDrawer();
}

// 8. Notificações Toast
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dfa85e" stroke-width="2.2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// 9. Checkout WhatsApp (Mensagem Limpa e Sem Emojis)
function checkoutViaWhatsApp() {
  if (cart.items.length === 0) {
    alert('Seu carrinho está vazio! Adicione produtos antes de finalizar.');
    return;
  }

  const phone = '558491436368'; // Número Oficial da Logo
  const modality = cart.deliveryType === 'pickup' ? 'Retirada no Balcão' : 'Entrega Delivery';
  const notes = document.getElementById('cart-order-notes')?.value.trim();

  let msg = `Olá, Forno Artesão! Tudo bem?\n\n`;
  msg += `Gostaria de fazer o pedido dos seguintes produtos:\n\n`;

  cart.items.forEach(item => {
    msg += `*${item.quantity}x* ${item.name} (${item.weight})\n`;
  });

  msg += `\nOpção: ${modality}\n`;

  if (notes && notes !== '' && notes !== 'Nenhuma observação informada.') {
    msg += `Observação: ${notes}\n`;
  }

  msg += `\nVocês conseguem preparar para mim? Muito obrigado(a)!`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// 10. Modal Quick View
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickview-modal');
  const content = document.getElementById('quickview-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="modal-card">
      <button class="modal-close-btn" onclick="closeQuickView()">✕</button>
      <div class="modal-media">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="modal-info">
        <span class="modal-category">${getCategoryName(product.category)} • ${product.weight}</span>
        <h2 class="modal-title">${product.name}</h2>
        <div class="modal-price">${formatCurrency(product.price)}</div>
        <p class="modal-desc">${product.description}</p>
        <div class="modal-ingredients">
          <strong>Ingredientes Selecionados:</strong><br/>
          ${product.ingredients}
        </div>
        <div class="modal-actions">
          <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="handleAddToCart('${product.id}'); closeQuickView();">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 11. Inicialização e Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza produtos e carrinho inicial
  renderProducts();
  renderCart();

  // Botão do Carrinho no Topo Direito
  const cartTriggerBtn = document.getElementById('cart-btn');
  if (cartTriggerBtn) {
    cartTriggerBtn.addEventListener('click', openCartDrawer);
  }

  // Fechamento do Drawer
  const closeBtn = document.getElementById('cart-drawer-close');
  const overlay = document.getElementById('cart-overlay');
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeQuickView();
    }
  });

  // Alternar Retirada / Delivery
  const pickupBtn = document.getElementById('opt-pickup');
  const deliveryBtn = document.getElementById('opt-delivery');
  if (pickupBtn && deliveryBtn) {
    pickupBtn.addEventListener('click', () => {
      pickupBtn.classList.add('active');
      deliveryBtn.classList.remove('active');
      cart.setDeliveryType('pickup');
    });
    deliveryBtn.addEventListener('click', () => {
      deliveryBtn.classList.add('active');
      pickupBtn.classList.remove('active');
      cart.setDeliveryType('delivery');
    });
  }

  // Filtro por Categorias (Tabs)
  const categoryPills = document.querySelectorAll('.category-pill');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category');
      const searchVal = document.getElementById('catalog-search')?.value || '';
      renderProducts(cat, searchVal);
    });
  });

  // Busca em Tempo Real no Catálogo
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activePill = document.querySelector('.category-pill.active');
      const activeCat = activePill ? activePill.getAttribute('data-category') : 'todos';
      renderProducts(activeCat, e.target.value);
    });
  }

  // Efeito de Scroll no Header
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle com Animação e Overlay
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');

  function closeMobileMenu() {
    mainNav?.classList.remove('active');
    mobileBtn?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    mainNav?.classList.add('active');
    mobileBtn?.classList.add('active');
    mobileOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('active');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileOverlay?.addEventListener('click', closeMobileMenu);

    // Fecha ao clicar em um link
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Limpar Carrinho
  const clearBtn = document.getElementById('btn-clear-cart');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Deseja realmente esvaziar seu carrinho?')) {
        cart.clear();
      }
    });
  }

  // Fechar Modal ao Clicar no Fundo
  const quickviewModal = document.getElementById('quickview-modal');
  if (quickviewModal) {
    quickviewModal.addEventListener('click', (e) => {
      if (e.target === quickviewModal) {
        closeQuickView();
      }
    });
  }
});
