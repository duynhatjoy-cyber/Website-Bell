with open('SP – Bellhop PMS-html/PMS.dc.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if any(w in line for w in ['Dùng thử', 'Bắt đầu', 'Chuyển dữ liệu', 'Đang dùng phần mềm khác', 'trial', 'dang-ky']):
            print(f"{i+1}: {line.strip()[:120]}")

