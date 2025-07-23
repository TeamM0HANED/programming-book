// ملف JavaScript شامل لجميع وظائف الكتاب
// يحتوي على جميع الوظائف المطلوبة لتشغيل الكتاب بشكل صحيح

(function() {
    'use strict';
    
    // ===== وظائف الاختبارات =====
    function initializeQuizzes() {
        const quizOptions = document.querySelectorAll('.quiz-options li');
        
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                const isCorrect = this.getAttribute('data-correct') === 'true';
                const siblings = this.parentNode.querySelectorAll('li');
                
                // إزالة جميع الفئات السابقة
                siblings.forEach(sibling => {
                    sibling.classList.remove('correct', 'wrong');
                });
                
                if (isCorrect) {
                    this.classList.add('correct');
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
    
    // ===== وظائف التنقل =====
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // ===== وظائف نسخ الكود =====
    function setupCodeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const codeBlock = this.closest('.code-container').querySelector('pre code') || 
                                 this.closest('.code-container').querySelector('pre');
                
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    
                    navigator.clipboard.writeText(code).then(() => {
                        const originalText = this.textContent;
                        this.textContent = 'تم النسخ!';
                        this.style.background = '#28a745';
                        
                        setTimeout(() => {
                            this.textContent = originalText;
                            this.style.background = '#667eea';
                        }, 2000);
                    }).catch(err => {
                        console.error('فشل في نسخ الكود:', err);
                        // fallback للمتصفحات القديمة
                        const textArea = document.createElement('textarea');
                        textArea.value = code;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        this.textContent = 'تم النسخ!';
                        setTimeout(() => {
                            this.textContent = 'نسخ';
                        }, 2000);
                    });
                }
            });
        });
    }
    
    // ===== وظائف التبويبات =====
    function setupTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                const tabContainer = this.closest('.tabs');
                
                // إزالة الفئة النشطة من جميع الأزرار والمحتوى
                tabContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                tabContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر والمحتوى المحدد
                this.classList.add('active');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
    
    // ===== وظائف الأكورديون =====
    function setupAccordion() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isActive = content.classList.contains('active');
                
                // إغلاق جميع الأكورديونات الأخرى
                document.querySelectorAll('.accordion-content').forEach(item => {
                    item.classList.remove('active');
                });
                
                // فتح الأكورديون المحدد إذا لم يكن مفتوحاً
                if (!isActive) {
                    content.classList.add('active');
                }
            });
        });
    }
    
    // ===== وظائف التأثيرات البصرية =====
    function setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        // مراقبة العناصر التي تحتاج تأثير الظهور
        document.querySelectorAll('.chapter-content, .feature-card, .code-example, .quiz-section').forEach(el => {
            observer.observe(el);
        });
    }
    

    

    
    // ===== وظائف زر العودة للأعلى =====
    function createBackToTopButton() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s;
            opacity: 0;
            visibility: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(backToTopBtn);
        
        // إظهار/إخفاء الزر حسب موضع التمرير
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
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
    
    // ===== تهيئة جميع الوظائف =====
    function initializeAll() {
        initializeQuizzes();
        setupSmoothScrolling();
        setupCodeCopyButtons();
        setupTabs();
        setupAccordion();
        setupScrollEffects();
        createBackToTopButton();

        console.log('تم تحميل جميع وظائف الكتاب بنجاح');
    }
    
    // ===== تشغيل التهيئة =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAll);
    } else {
        initializeAll();
    }
    
    // ===== تصدير الوظائف للاستخدام العام =====
    window.BookFunctions = {
        initializeQuizzes: initializeQuizzes,
        setupSmoothScrolling: setupSmoothScrolling,
        setupCodeCopyButtons: setupCodeCopyButtons,
        setupTabs: setupTabs,
        setupAccordion: setupAccordion,
        setupScrollEffects: setupScrollEffects,
        createBackToTopButton: createBackToTopButton,
        initializeAll: initializeAll
    };
    
})();
