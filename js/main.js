// ملف JavaScript الرئيسي للكتاب

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// تهيئة التطبيق
function initializeApp() {
    setupCodeCopyButtons();
    setupNavigation();
    setupScrollEffects();
    setupTabs();
    setupAccordion();
}

// إعداد أزرار نسخ الكود
function setupCodeCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.closest('.code-container').querySelector('pre code') || 
                             this.closest('.code-container').querySelector('pre');
            
            if (codeBlock) {
                const code = codeBlock.textContent;
                
                // نسخ النص إلى الحافظة
                navigator.clipboard.writeText(code).then(() => {
                    // تغيير نص الزر مؤقتاً
                    const originalText = this.textContent;
                    this.textContent = 'تم النسخ!';
                    this.style.background = '#28a745';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.background = '#667eea';
                    }, 2000);
                }).catch(err => {
                    console.error('فشل في نسخ الكود:', err);
                    alert('فشل في نسخ الكود');
                });
            }
        });
    });
}

// إعداد التنقل
function setupNavigation() {
    // إضافة تأثير التمرير السلس
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // إضافة زر العودة للأعلى
    createBackToTopButton();
}

// إنشاء زر العودة للأعلى
function createBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // إظهار/إخفاء الزر حسب موضع التمرير
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // العودة للأعلى عند النقر
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// إعداد تأثيرات التمرير
function setupScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // مراقبة العناصر التي تحتاج تأثير الظهور
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
}

// إعداد التبويبات
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // إزالة الفئة النشطة من جميع الأزرار والمحتويات
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر والمحتوى المحدد
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// إعداد الأكورديون
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // إغلاق جميع الأكورديونات الأخرى
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            
            // فتح/إغلاق الأكورديون المحدد
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });
}





// دوال مساعدة
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// تحسين الأداء - تأخير تحميل الصور
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// تشغيل تأخير تحميل الصور
lazyLoadImages();



// تفعيل اختبارات الفهم
function initializeQuizzes() {
    document.querySelectorAll('.quiz-options li').forEach(option => {
        option.addEventListener('click', function() {
            const isCorrect = this.getAttribute('data-correct') === 'true';
            const siblings = this.parentNode.querySelectorAll('li');

            // إزالة جميع الفئات السابقة
            siblings.forEach(sibling => {
                sibling.classList.remove('correct', 'wrong');
            });

            if (isCorrect) {
                this.classList.add('correct');
                // إضافة تأثير بصري للإجابة الصحيحة
                this.style.animation = 'pulse 0.6s ease-in-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 600);
            } else {
                this.classList.add('wrong');
                // إظهار الإجابة الصحيحة
                siblings.forEach(sibling => {
                    if (sibling.getAttribute('data-correct') === 'true') {
                        sibling.classList.add('correct');
                    }
                });
            }
        });
    });
}

// تشغيل الاختبارات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير قصير للتأكد من تحميل جميع العناصر
    setTimeout(() => {
        initializeQuizzes();
    }, 100);
});

// إعادة تشغيل الاختبارات إذا تم تحميل محتوى جديد ديناميكياً
function reinitializeQuizzes() {
    initializeQuizzes();
}

// إضافة مراقب للعناصر الجديدة (للمحتوى الديناميكي)
const quizObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.querySelector && node.querySelector('.quiz-options')) {
                    initializeQuizzes();
                }
            });
        }
    });
});

// بدء مراقبة التغييرات في DOM
quizObserver.observe(document.body, {
    childList: true,
    subtree: true
});
