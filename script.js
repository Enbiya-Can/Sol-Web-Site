        let currentUser = null;
        let isWalletConnected = false;
        
        // Cüzdan bakiyeleri
        let walletBalance = {
            sol: 12.45,
            sols: 2450,
            usdRate: 100 // 1 SOL = 100 TL
        };

        $(document).ready(function() {
            // Splash screen'i gizle
            setTimeout(() => $('#splash').fadeOut(), 3500);
            
            // Login form
            $('#loginForm').on('submit', function(e) {
                e.preventDefault();
                
                const email = $(this).find('input[type="email"]').val();
                const password = $(this).find('input[type="password"]').val();
                
                if (email && password) {
                    // Kullanıcı oluştur
                    currentUser = { 
                        name: 'Kullanıcı', 
                        username: '@kullanici', 
                        avatar: 'K' 
                    };
                    
                    // Giriş yap
                    loginUser();
                } else {
                    showNotification('Lütfen e-posta ve şifrenizi girin! ⚠️', 'warning');
                }
            });
            
            // Trending clicks
            $('.trending-item').on('click', function() {
                showNotification(`${$(this).text()} aranıyor... 🔍`, 'info');
            });
            
            // Post actions
            $(document).on('click', '.post-action', function() {
                const action = $(this).data('action');
                const $this = $(this);
                
                if (action === 'like') {
                    const $icon = $this.find('ion-icon');
                    const $count = $this.find('.count');
                    const currentCount = parseInt($count.text());
                    
                    if ($this.hasClass('liked')) {
                        $icon.attr('name', 'heart-outline');
                        $count.text(currentCount - 1);
                        $this.removeClass('liked');
                        showNotification('Beğeni kaldırıldı! 💔', 'info');
                    } else {
                        $icon.attr('name', 'heart');
                        $count.text(currentCount + 1);
                        $this.addClass('liked');
                        showNotification('Gönderi beğenildi! ❤️', 'success');
                    }
                } else if (action === 'share') {
                    const $count = $this.find('.count');
                    const currentCount = parseInt($count.text());
                    $count.text(currentCount + 1);
                    showNotification('Gönderi paylaşıldı! 🔄', 'success');
                } else if (action === 'comment') {
                    showNotification('Yorum özelliği yakında! 💬', 'info');
                } else if (action === 'tip') {
                    if (!isWalletConnected) {
                        showNotification('Bahşiş göndermek için cüzdan bağlayın! 💳', 'warning');
                    } else {
                        sendTip();
                    }
                }
            });
        });

        // Bakiye güncelleme
        function updateBalance() {
            const solValue = walletBalance.sol.toFixed(2);
            const tlValue = (walletBalance.sol * walletBalance.usdRate).toLocaleString('tr-TR');
            
            // Ana bakiye kartını güncelle
            $('.card-custom h3:contains("SOL")').text(`${solValue} SOL`);
            $('.card-custom small:contains("₺")').text(`≈ ₺${tlValue}`);
            
            // Sidebar bakiyesini güncelle
            $('[style*="primary-gradient"] h3').text(`${solValue} SOL`);
            $('[style*="primary-gradient"] small').text(`≈ ₺${tlValue}`);
            
            // Cüzdan sayfası bakiyesini güncelle
            $('#wallet .card-custom h2').first().text(solValue);
            $('#wallet .card-custom p').first().text(`≈ ₺${tlValue}`);
        }

        // Bahşiş gönderme
        function sendTip() {
            // Bahşiş miktarını sor
            const tipAmount = prompt('Kaç SOL bahşiş göndermek istiyorsunuz?', '0.1');
            
            if (!tipAmount || tipAmount === '' || tipAmount === null) {
                return;
            }
            
            const amount = parseFloat(tipAmount);
            
            if (isNaN(amount) || amount <= 0) {
                showNotification('Geçerli bir miktar girin! ⚠️', 'warning');
                return;
            }
            
            if (amount > walletBalance.sol) {
                showNotification('Yetersiz bakiye! Mevcut bakiyeniz: ' + walletBalance.sol.toFixed(2) + ' SOL 💸', 'error');
                return;
            }
            
            // Bakiyeden düş
            walletBalance.sol -= amount;
            
            // Bakiyeyi güncelle
            updateBalance();
            
            // İşlem geçmişine ekle
            addTransaction('Bahşiş Gönderildi', `@kullanıcıya bahşiş`, `-${amount} SOL`);
            
            showNotification(`${amount} SOL bahşiş başarıyla gönderildi! 💰`, 'success');
            
            // 2 saniye sonra blockchain onayı simüle et
            setTimeout(() => {
                showNotification('İşlem blockchain\'de onaylandı! ✅', 'success');
            }, 2000);
        }

        // İşlem geçmişine ekleme
        function addTransaction(title, description, amount) {
            const isPositive = amount.startsWith('+');
            const colorClass = isPositive ? 'text-success' : 'text-danger';
            
            const transactionHTML = `
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-3 border-bottom">
                    <div class="mb-2 mb-sm-0">
                        <h6 class="mb-1">${title}</h6>
                        <small class="text-muted">${description}</small>
                    </div>
                    <span class="${colorClass} fw-bold">${amount}</span>
                </div>
            `;
            
            // Cüzdan sayfasındaki işlem geçmişine ekle
            $('#wallet .card-body').last().prepend(transactionHTML);
        }

        // Sayfa gösterme
        function showPage(pageId) {
            $('.page').addClass('d-none');
            $(`#${pageId}`).removeClass('d-none');
            $('.nav-link').removeClass('active');
            $(`.nav-link[onclick="showPage('${pageId}')"]`).addClass('active');
            $('.navbar-collapse').collapse('hide');
        }

        // Giriş yapma
        function loginUser() {
            $('#mainNavbar').show();
            $('#login').addClass('d-none');
            $('#feed').removeClass('d-none');
            updateBalance(); // İlk bakiye güncellemesi
            showNotification('SolSocial\'e hoş geldiniz! 🎉', 'success');
        }

        // Demo giriş
        function demoLogin() {
            $('#loginForm input[type="email"]').val('demo@solsocial.com');
            $('#loginForm input[type="password"]').val('demo123');
            showNotification('Demo bilgileri dolduruldu! Giriş Yap\'a tıklayın. 👆', 'info');
        }

        // Phantom bağlantısı
        function connectPhantom() {
            if (!currentUser) {
                showNotification('Önce giriş yapın! 🔐', 'warning');
                return;
            }
            
            isWalletConnected = true;
            $('#walletBtn').html('<ion-icon name="wallet"></ion-icon> Bağlandı');
            showNotification('Phantom cüzdan bağlandı! 👻', 'success');
        }

        // Cüzdan bağlama
        function connectWallet() {
            if (!isWalletConnected) {
                connectPhantom();
            } else {
                showNotification('Cüzdan zaten bağlı! 💳', 'info');
            }
        }

        // Gönderi oluşturma
        function createPost() {
            const content = $('#postInput').val().trim();
            
            if (!content) {
                showNotification('Lütfen bir şeyler yazın! ✍️', 'warning');
                return;
            }
            
            if (!currentUser) {
                showNotification('Gönderi paylaşmak için giriş yapın! 🔐', 'warning');
                return;
            }
            
            const postHTML = `
                <div class="card card-custom mb-3">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar me-3">${currentUser.avatar}</div>
                            <div class="flex-grow-1">
                                <h6 class="mb-0">${currentUser.name}</h6>
                                <small class="text-muted">${currentUser.username} • şimdi</small>
                            </div>
                        </div>
                        <p class="mb-3">${content}</p>
                        <div class="post-actions">
                            <div class="post-action" data-action="comment">
                                <ion-icon name="chatbubble-outline"></ion-icon>
                                <span class="count">0</span>
                            </div>
                            <div class="post-action" data-action="share">
                                <ion-icon name="repeat-outline"></ion-icon>
                                <span class="count">0</span>
                            </div>
                            <div class="post-action" data-action="like">
                                <ion-icon name="heart-outline"></ion-icon>
                                <span class="count">0</span>
                            </div>
                            <div class="post-action" data-action="tip">
                                <ion-icon name="diamond-outline"></ion-icon>
                                <span>Bahşiş</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            $('#postsContainer').prepend(postHTML);
            $('#postInput').val('');
            
            // Gönderi ödülü ver
            walletBalance.sols += 10;
            updateBalance();
            addTransaction('SOLS Token Kazanıldı', 'Gönderi paylaşım ödülü', '+10 SOLS');
            
            showNotification('Gönderi paylaşıldı! +10 SOLS kazandınız! 🎉', 'success');
        }

        // Bildirim gösterme
        function showNotification(message, type) {
            const alertClass = type === 'success' ? 'alert-success' : 
                              type === 'warning' ? 'alert-warning' : 
                              type === 'error' ? 'alert-danger' : 'alert-info';
            
            const notification = $(`
                <div class="alert ${alertClass} notification alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            $('body').append(notification);
            setTimeout(() => notification.alert('close'), 3000);
        }