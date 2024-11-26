export function adjustSelectWidth() {
    const select = this;
    const text = select.options[select.selectedIndex].text;
    const temp = document.createElement('select');
    const option = document.createElement('option');
    temp.style.position = "absolute";
    option.text = text;
    temp.add(option);
    document.body.appendChild(temp);

    requestAnimationFrame(() => {
        select.style.width = temp.offsetWidth + "px";
        document.body.removeChild(temp);
    });
}

export function setCursorToEnd(element) {
    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);
}

export function generateUUID() {
    // Получаем текущее время в миллисекундах
    let d = new Date().getTime();
    // Если доступна производительность, то добавляем ее значение к времени
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    // Генерируем UUID в формате 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}