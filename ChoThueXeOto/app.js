
const database = {
    cars: [
        { id: 1, name: "Toyota Vios", plate: "51A-12345", price: 700000, status: "Sẵn sàng" },
        { id: 2, name: "Honda City", plate: "51B-45678", price: 800000, status: "Đang thuê" },
        { id: 3, name: "Mazda 3", plate: "51C-78910", price: 900000, status: "Bảo trì" }
    ],
    customers: [
        { id: 1, name: "Nguyễn Văn An", phone: "0901234567", email: "an@gmail.com" },
        { id: 2, name: "Trần Văn Bình", phone: "0912345678", email: "binh@gmail.com" }
    ],
    bookings: [
        { id: 1, customer: "Nguyễn Văn An", car: "Toyota Vios", date: "2026-11-13", status: "Đã xác nhận" }
    ],
    payments: [
        { id: 1, customer: "Nguyễn Văn An", amount: 1400000, method: "Chuyển khoản", status: "Đã thanh toán" }
    ],
    gps: [
        { id: 1, car: "Toyota Vios", location: "TP. Hồ Chí Minh", status: "Đang hoạt động" },
        { id: 2, car: "Honda City", location: "Thủ Đức", status: "Đang hoạt động" }
    ],
    risks: [
        { id: 1, customer: "Nguyễn Văn An", level: "Trung bình", description: "Chưa xác nhận đầy đủ giấy tờ", status: "Chờ xử lý" }
    ]
};

const configs = {
    cars: {
        title: "Quản lý xe",
        add: "Thêm xe",
        fields: [
            ["name", "Tên xe"],
            ["plate", "Biển số xe"],
            ["price", "Giá thuê/ngày", "number"],
            ["status", "Trạng thái", ["Sẵn sàng", "Đang thuê", "Bảo trì"]]
        ],
        columns: ["id", "name", "plate", "price", "status"]
    },
    customers: {
        title: "Khách hàng",
        add: "Thêm khách hàng",
        fields: [
            ["name", "Họ và tên"],
            ["phone", "Số điện thoại"],
            ["email", "Email"]
        ],
        columns: ["id", "name", "phone", "email"]
    },
    bookings: {
        title: "Đặt xe & hợp đồng",
        add: "Tạo đặt xe",
        fields: [
            ["customer", "Tên khách hàng"],
            ["car", "Tên xe"],
            ["date", "Ngày thuê", "date"],
            ["status", "Trạng thái", ["Chờ xác nhận", "Đã xác nhận", "Đã hoàn thành", "Đã hủy"]]
        ],
        columns: ["id", "customer", "car", "date", "status"]
    },
    payments: {
        title: "Thanh toán",
        add: "Thêm thanh toán",
        fields: [
            ["customer", "Tên khách hàng"],
            ["amount", "Số tiền", "number"],
            ["method", "Phương thức", ["Tiền mặt", "Chuyển khoản"]],
            ["status", "Trạng thái", ["Đã thanh toán", "Chưa thanh toán"]]
        ],
        columns: ["id", "customer", "amount", "method", "status"]
    },
    gps: {
        title: "Giám sát GPS",
        add: "Thêm xe giám sát",
        fields: [
            ["car", "Tên xe"],
            ["location", "Vị trí"],
            ["status", "Trạng thái", ["Đang hoạt động", "Mất kết nối"]]
        ],
        columns: ["id", "car", "location", "status"]
    },
    risks: {
        title: "Báo cáo rủi ro",
        add: "Thêm báo cáo",
        fields: [
            ["customer", "Tên khách hàng"],
            ["level", "Mức độ", ["Thấp", "Trung bình", "Cao"]],
            ["description", "Mô tả"],
            ["status", "Trạng thái", ["Chờ xử lý", "Đang xử lý", "Đã xử lý"]]
        ],
        columns: ["id", "customer", "level", "description", "status"]
    }
};

let currentPage = "dashboard";
let currentForm = null;

function saveData() {
    localStorage.setItem("lanuAutoData", JSON.stringify(database));
}

function loadData() {
    const saved = localStorage.getItem("lanuAutoData");
    if (saved) {
        Object.assign(database, JSON.parse(saved));
    }
}

function money(value) {
    return Number(value).toLocaleString("vi-VN") + " đ";
}

function renderDashboard() {
    const totalCars = database.cars.length;
    const availableCars = database.cars.filter(x => x.status === "Sẵn sàng").length;
    const totalCustomers = database.customers.length;
    const totalRevenue = database.payments
        .filter(x => x.status === "Đã thanh toán")
        .reduce((sum, x) => sum + Number(x.amount), 0);

    document.getElementById("content").innerHTML = `
        <div class="cards">
            <div class="card">
                <p>Tổng số xe</p>
                <h2>${totalCars}</h2>
            </div>
            <div class="card">
                <p>Xe sẵn sàng</p>
                <h2>${availableCars}</h2>
            </div>
            <div class="card">
                <p>Khách hàng</p>
                <h2>${totalCustomers}</h2>
            </div>
            <div class="card">
                <p>Doanh thu</p>
                <h2>${money(totalRevenue)}</h2>
            </div>
        </div>

        <div class="panel">
            <h3>Thông tin hệ thống</h3>
            <p>Chào mừng bạn đến với hệ thống quản lý cho thuê xe LaNu Auto.</p>
            <br>
            <p>Hãy sử dụng thanh menu bên trái để quản lý các chức năng.</p>
        </div>
    `;
}

function renderTable(page) {
    const config = configs[page];
    const data = database[page];

    let html = `
        <div class="panel">
            <div class="panel-header">
                <h3>${config.title}</h3>
                <button class="primary" onclick="openModal('${page}')">
                    + ${config.add}
                </button>
            </div>
            <table>
                <thead><tr>
                    ${config.columns.map(c => `<th>${getLabel(c)}</th>`).join("")}
                    <th>Thao tác</th>
                </tr></thead>
                <tbody>
    `;

    if (data.length === 0) {
        html += `<tr><td colspan="${config.columns.length + 1}" class="empty">Chưa có dữ liệu</td></tr>`;
    }

    data.forEach(item => {
        html += "<tr>";

        config.columns.forEach(column => {
            let value = item[column] ?? "";

            if (column === "price" || column === "amount") {
                value = money(value);
            }

            if (column === "status" || column === "level") {
                let className = "status";

                if (value === "Cao" || value === "Mất kết nối" || value === "Chưa thanh toán") {
                    className += " danger";
                } else if (value === "Trung bình" || value === "Chờ xử lý" || value === "Bảo trì") {
                    className += " warning";
                }

                value = `<span class="${className}">${escapeHTML(value)}</span>`;
            } else {
                value = escapeHTML(String(value));
            }

            html += `<td>${value}</td>`;
        });

        html += `
            <td>
                <button class="action delete" onclick="deleteItem('${page}', ${item.id})">
                    Xóa
                </button>
            </td>
        </tr>`;
    });

    html += "</tbody></table></div>";

    document.getElementById("content").innerHTML = html;
}

function getLabel(key) {
    const labels = {
        id: "Mã",
        name: "Họ tên / Tên xe",
        plate: "Biển số",
        price: "Giá thuê/ngày",
        status: "Trạng thái",
        phone: "Số điện thoại",
        email: "Email",
        customer: "Khách hàng",
        car: "Xe",
        date: "Ngày thuê",
        amount: "Số tiền",
        method: "Phương thức",
        location: "Vị trí",
        level: "Mức độ",
        description: "Mô tả"
    };

    return labels[key] || key;
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderReports() {
    const totalRevenue = database.payments
        .filter(x => x.status === "Đã thanh toán")
        .reduce((sum, x) => sum + Number(x.amount), 0);

    document.getElementById("content").innerHTML = `
        <div class="cards">
            <div class="card">
                <p>Tổng số xe</p>
                <h2>${database.cars.length}</h2>
            </div>
            <div class="card">
                <p>Tổng khách hàng</p>
                <h2>${database.customers.length}</h2>
            </div>
            <div class="card">
                <p>Tổng đặt xe</p>
                <h2>${database.bookings.length}</h2>
            </div>
            <div class="card">
                <p>Tổng doanh thu</p>
                <h2>${money(totalRevenue)}</h2>
            </div>
        </div>
        <div class="panel">
            <h3>Thống kê tình trạng xe</h3>
            ${database.cars.map(car => `
                <p style="margin:12px 0">
                    ${escapeHTML(car.name)} - ${escapeHTML(car.plate)}:
                    <b>${escapeHTML(car.status)}</b>
                </p>
            `).join("")}
        </div>
    `;
}

function renderGPS() {
    document.getElementById("content").innerHTML = `
        <div class="panel">
            <h3>Bản đồ giám sát (mô phỏng)</h3>
            <div style="background:#e8eef4;padding:60px 20px;text-align:center;border-radius:10px">
                <h2>📍 Bản đồ GPS</h2>
                <p>Vị trí bên dưới là dữ liệu mô phỏng, chưa phải vị trí GPS thực tế.</p>
            </div>
        </div>
    `;
}

function renderPage(page) {
    currentPage = page;

    const title = page === "dashboard"
        ? "Tổng quan"
        : page === "reports"
            ? "Báo cáo thống kê"
            : page === "gps"
                ? "Giám sát GPS"
                : configs[page].title;

    document.getElementById("page-title").textContent = title;

    document.querySelectorAll(".nav").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    if (page === "dashboard") renderDashboard();
    else if (page === "reports") renderReports();
    else if (page === "gps") renderGPS();
    else renderTable(page);
}

function openModal(page) {
    currentForm = page;

    const config = configs[page];
    document.getElementById("modal-title").textContent = config.add;

    document.getElementById("form-fields").innerHTML =
        config.fields.map(([key, label, type]) => {
            let field;

            if (Array.isArray(type)) {
                field = `
                    <select name="${key}" required>
                        ${type.map(option => `<option>${escapeHTML(option)}</option>`).join("")}
                    </select>
                `;
            } else {
                field = `<input name="${key}" type="${type || "text"}" required>`;
            }

            return `
                <div class="field">
                    <label>${label}</label>
                    ${field}
                </div>
            `;
        }).join("");

    document.getElementById("modal").classList.add("show");
}

function closeModal() {
    document.getElementById("modal").classList.remove("show");
}

document.getElementById("data-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const item = {
        id: Date.now()
    };

    for (const [key, value] of formData.entries()) {
        item[key] = value;
    }

    if (currentForm === "cars" || currentForm === "payments") {
        const numberField = currentForm === "cars" ? "price" : "amount";
        item[numberField] = Number(item[numberField]);
    }

    database[currentForm].push(item);

    saveData();
    closeModal();
    this.reset();
    renderPage(currentForm);
});

function deleteItem(page, id) {
    if (!confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) return;

    database[page] = database[page].filter(item => item.id !== id);

    saveData();
    renderPage(page);
}

document.querySelectorAll(".nav").forEach(button => {
    button.addEventListener("click", () => {
        renderPage(button.dataset.page);
    });
});

loadData();
renderPage("dashboard");
