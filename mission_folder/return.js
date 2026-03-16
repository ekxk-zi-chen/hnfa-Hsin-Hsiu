// ==========================================
// return.js - 裝備歸還模組 (v3.9 共用版)
// ==========================================

function openSingleReturnModal(eqId, loanId, qty, borrower) {
    document.getElementById('batch-return-modal').classList.add('flex');
    const listDiv = document.getElementById('batch-return-list'); listDiv.innerHTML = "";
    const eq = equipmentCache.find(e => e.id === eqId);
    renderReturnItem(listDiv, eq ? eq.name : '裝備', loanId, qty, borrower);
}

function openBatchReturnModal() {
    if (selectedItems.size === 0) { alert("請先勾選歸還裝備"); return; }
    document.getElementById('batch-return-modal').classList.add('flex');
    const listDiv = document.getElementById('batch-return-list'); listDiv.innerHTML = "";
    let hasLoan = false;
    selectedItems.forEach(id => {
        const eq = equipmentCache.find(e => e.id === id);
        if (eq && eq.active_loans) eq.active_loans.forEach(l => { hasLoan=true; renderReturnItem(listDiv, eq.name, l.loan_id, l.qty, l.borrower); });
    });
    if (!hasLoan) { alert("無借出紀錄"); closeModal('batch-return-modal'); }
}

function renderReturnItem(container, eqName, loanId, maxQty, borrower) {
    container.innerHTML += `<div class="flex items-center justify-between bg-gray-700 p-3 rounded border border-gray-600">
        <div class="flex items-center gap-3"><input type="checkbox" class="return-checkbox w-5 h-5" checked data-loan-id="${loanId}"><div class="text-sm"><div class="text-white font-bold">${eqName}</div><div class="text-gray-300 text-xs">👤 ${borrower} (借: ${maxQty})</div></div></div>
        <div class="flex items-center gap-2"><label class="text-xs text-gray-400">歸還:</label><input type="number" class="return-qty-input w-16 bg-gray-800 text-white p-1 rounded border border-gray-500 text-center" value="${maxQty}" min="1" max="${maxQty}" data-loan-id="${loanId}"></div></div>`;
}

// 🔥 核心修改：打包並送給統一介面卡
async function submitBatchReturn() {
    const checkboxes = document.querySelectorAll('.return-checkbox:checked');
    if (checkboxes.length === 0) return alert("請勾選");
    
    const items = [];
    checkboxes.forEach(cb => {
        const loanId = cb.dataset.loanId;
        const qty = parseInt(document.querySelector(`.return-qty-input[data-loan-id="${loanId}"]`).value);
        if (qty > 0) items.push({ loanId: loanId, returnQty: qty });
    });

    toggleLoader(true, "批量歸還中..."); 
    closeModal('batch-return-modal');
    try { 
        await window.submitToBackend({ // 呼叫介面卡
            action: 'batch_return_equipment', 
            userId: userId, 
            displayName: displayName, 
            items: items 
        }); 
        alert("歸還成功"); 
        selectedItems.clear(); 
        if(typeof isExportMode !== 'undefined' && isExportMode) toggleExportMode(); 
        if(typeof fetchEquipmentData === 'function') fetchEquipmentData(false); 
    } catch (e) { 
        alert(e.message); 
    } finally { 
        toggleLoader(false); 
    }
}