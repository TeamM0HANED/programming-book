// ملف JavaScript مخصص لمعالجة الاختبارات في جميع الفصول
// هذا الملف يحتوي على جميع وظائف الاختبارات المطلوبة

(function() {
    'use strict';
    
    // تفعيل اختبارات الفهم
    function initializeQuizzes() {
        const quizOptions = document.querySelectorAll('.quiz-options li');
        
        if (quizOptions.length === 0) {
            return; // لا توجد اختبارات في هذه الصفحة
        }
        
        quizOptions.forEach(option => {
            // إزالة أي مستمعين سابقين لتجنب التكرار
            option.removeEventListener('click', handleQuizClick);
            option.addEventListener('click', handleQuizClick);
        });
        
        console.log(`تم تفعيل ${quizOptions.length} خيار اختبار`);
    }
    
    // معالج النقر على خيارات الاختبار
    function handleQuizClick() {
        const isCorrect = this.getAttribute('data-correct') === 'true';
        const siblings = this.parentNode.querySelectorAll('li');
        
        // إزالة جميع الفئات السابقة
        siblings.forEach(sibling => {
            sibling.classList.remove('correct', 'wrong');
            sibling.style.animation = '';
        });
        
        if (isCorrect) {
            this.classList.add('correct');
            // إضافة تأثير بصري للإجابة الصحيحة
            this.style.animation = 'pulse 0.6s ease-in-out';
            
            // إضافة صوت نجاح (اختياري)
            playSuccessSound();
            
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
            
            // إضافة صوت خطأ (اختياري)
            playErrorSound();
        }
        
        // تتبع الإحصائيات (اختياري)
        trackQuizAnswer(isCorrect);
    }
    
    // تشغيل صوت النجاح (اختياري)
    function playSuccessSound() {
        try {
            // يمكن إضافة ملف صوتي هنا
            // const audio = new Audio('../sounds/success.mp3');
            // audio.play();
        } catch (e) {
            // تجاهل الأخطاء الصوتية
        }
    }
    
    // تشغيل صوت الخطأ (اختياري)
    function playErrorSound() {
        try {
            // يمكن إضافة ملف صوتي هنا
            // const audio = new Audio('../sounds/error.mp3');
            // audio.play();
        } catch (e) {
            // تجاهل الأخطاء الصوتية
        }
    }
    
    // تتبع إحصائيات الاختبارات (اختياري)
    function trackQuizAnswer(isCorrect) {
        try {
            const stats = JSON.parse(localStorage.getItem('quizStats') || '{}');
            const currentPage = window.location.pathname;
            
            if (!stats[currentPage]) {
                stats[currentPage] = { correct: 0, wrong: 0 };
            }
            
            if (isCorrect) {
                stats[currentPage].correct++;
            } else {
                stats[currentPage].wrong++;
            }
            
            localStorage.setItem('quizStats', JSON.stringify(stats));
        } catch (e) {
            // تجاهل أخطاء التخزين المحلي
        }
    }
    

    
    // الحصول على إحصائيات الاختبارات
    function getQuizStats() {
        try {
            return JSON.parse(localStorage.getItem('quizStats') || '{}');
        } catch (e) {
            return {};
        }
    }
    
    // إضافة مراقب للعناصر الجديدة (للمحتوى الديناميكي)
    function setupQuizObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.querySelector && node.querySelector('.quiz-options')) {
                            setTimeout(initializeQuizzes, 100);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // تهيئة الاختبارات عند تحميل الصفحة
    function init() {
        // انتظار تحميل DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeQuizzes, 100);
                setupQuizObserver();
            });
        } else {
            setTimeout(initializeQuizzes, 100);
            setupQuizObserver();
        }
    }
    
    // تصدير الوظائف للاستخدام العام
    window.QuizHandler = {
        init: init,
        initializeQuizzes: initializeQuizzes,
        getStats: getQuizStats
    };
    
    // تشغيل التهيئة تلقائياً
    init();
    
})();

// إضافة أنماط CSS إضافية للاختبارات
(function() {
    const additionalStyles = `
        @keyframes quizPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .quiz-options li.correct {
            animation: quizPulse 0.6s ease-in-out;
        }
        
        .quiz-options li.wrong {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .quiz-section {
            position: relative;
        }
        
        .quiz-section::before {
            content: "🧠";
            position: absolute;
            top: -10px;
            right: 20px;
            font-size: 2rem;
            background: white;
            padding: 0 10px;
        }
        
        /* تحسينات للأجهزة المحمولة */
        @media (max-width: 768px) {
            .quiz-options li {
                padding: 1.5rem 1rem;
                font-size: 1rem;
            }
            
            .quiz-options li::after {
                left: 0.5rem;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
})();
