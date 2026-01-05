const invitationConfig = {
    salt: "ANTISTRESS_TEST_2024_SALT_KEY",
    validCodeHashes: [
        "e100a4b75402648b785c36fa2a734cf3dab51ec2928a55639829da43e16046ad"
    ]
};

class InvitationValidator {
    constructor() {
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    async validate(code) {
        this.attempts++;
        
        if (this.attempts > this.maxAttempts) {
            return {
                valid: false,
                message: `尝试次数过多，请稍后再试`,
                attemptsLeft: 0
            };
        }
        
        const normalizedCode = code.trim().toUpperCase();
        
        const charMap = {
            'M': 'Z', 'T': 'F', 'S': 'G',
            '2': '7', '5': '0', '7': '2', '8': '3'
        };
        
        function encrypt(str) {
            let result = '';
            for (let char of str) {
                result += charMap[char] || char;
            }
            return result;
        }
        
        const encryptedExpectedCode = 'ZFG7023';
        const encryptedInput = encrypt(normalizedCode);
        
        const isValid = encryptedInput === encryptedExpectedCode;
        
        return {
            valid: isValid,
            message: isValid ? "验证成功！" : `邀请码无效，还剩${this.maxAttempts - this.attempts}次尝试机会`,
            attemptsLeft: this.maxAttempts - this.attempts
        };
    }
    
    saveValidation(code) {
        try {
            const validation = {
                code: code,
                timestamp: Date.now(),
                valid: true
            };
            
            localStorage.setItem('invitation_validation', JSON.stringify(validation));
            localStorage.setItem('test_access', 'granted');
            sessionStorage.setItem('test_access', 'granted');
            return true;
        } catch (error) {
            console.error('保存验证状态失败:', error);
            return false;
        }
    }
    
    checkValidation() {
        try {
            const testAccess = localStorage.getItem('test_access') || sessionStorage.getItem('test_access');
            return testAccess === 'granted';
        } catch (error) {
            return false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const validator = new InvitationValidator();
    
    const codeInput = document.getElementById('invitationCode');
    const submitBtn = document.getElementById('submitInvitation');
    const messageDiv = document.getElementById('invitationMessage');
    
    if (!codeInput || !submitBtn || !messageDiv) {
        return;
    }
    
    if (validator.checkValidation()) {
        window.location.href = 'test.html';
        return;
    }
    
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await validateCode();
        } catch (error) {
            showMessage('发生错误：' + error.message, 'error');
        }
    });
    
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            validateCode();
        }
    });
    
    async function validateCode() {
        const code = codeInput.value.trim();
        
        if (!code) {
            showMessage('请输入邀请码', 'error');
            codeInput.focus();
            return;
        }
        
        try {
            const result = await validator.validate(code);
            showMessage(result.message, result.valid ? 'success' : 'error');
            
            if (result.valid) {
                validator.saveValidation(code);
                
                setTimeout(() => {
                    window.location.href = 'test.html';
                }, 1500);
            } else {
                if (result.attemptsLeft <= 0) {
                    submitBtn.disabled = true;
                    codeInput.disabled = true;
                    showMessage('尝试次数已用完，请刷新页面后重试', 'error');
                    
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        codeInput.disabled = false;
                        showMessage('', '');
                    }, 60000);
                }
                
                codeInput.select();
            }
        } catch (error) {
            showMessage('验证出错：' + error.message, 'error');
        }
    }
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        } else {
            messageDiv.style.backgroundColor = '';
            messageDiv.style.color = '';
            messageDiv.style.border = '';
        }
    }
    
    const hintDiv = document.querySelector('.hint');
    hintDiv.innerHTML = `
        <div>
            <p><i class="fas fa-lightbulb"></i> 提示：邀请码通常是8-12位字母数字组合</p>
        </div>
    `;
});
