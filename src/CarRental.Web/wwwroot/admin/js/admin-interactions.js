const adminMain = document.querySelector(".admin-main");
const pageTabGroups = {
  owners: [
    { id: "profile", label: "Hồ sơ", children: [1, 2, 3] },
    { id: "vehicles", label: "Xe & thanh toán", children: [4, 5] },
    { id: "activity", label: "Hoạt động", children: [6] },
  ],
  listings: [
    { id: "queue", label: "Chờ kiểm duyệt", children: [1, 2, 3] },
    { id: "review", label: "Đối chiếu tin đăng", children: [4] },
  ],
  disputes: [
    { id: "cases", label: "Vụ việc đang mở", children: [1, 2, 3] },
    { id: "case-detail", label: "Theo dõi xử lý", children: [4] },
  ],
  users: [
    { id: "accounts", label: "Tài khoản", children: [1, 2, 3] },
    { id: "review", label: "Cần rà soát", children: [4] },
  ],
  fees: [
    { id: "rules", label: "Quy tắc phí", children: [1, 2, 3, 4] },
    { id: "principles", label: "Nguyên tắc", children: [5] },
    { id: "history", label: "Lịch sử", children: [6] },
  ],
  revenue: [
    { id: "summary", label: "Tổng quan", children: [1, 2, 3] },
    { id: "settlements", label: "Đối soát", children: [4, 5, 6] },
  ],
  logs: [
    { id: "activity", label: "Nhật ký", children: [1, 2, 3] },
    { id: "event", label: "Chi tiết sự kiện", children: [4] },
  ],
};

const setupAdminWorkspace = () => {
  if (!adminMain) return;
  const groups = pageTabGroups[adminMain.dataset.page];
  if (!groups) return;

  const originalChildren = [...adminMain.children];
  const title = originalChildren[0];
  const footer = originalChildren.find(child => child.classList.contains("footer"));
  adminMain.classList.add("admin-main--tabbed");
  const workspace = document.createElement("section");
  workspace.className = `admin-workspace admin-workspace--${adminMain.dataset.page}`;
  const tablist = document.createElement("nav");
  tablist.className = "admin-workspace__tabs";
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-label", "Các mục quản trị");
  const panels = [];

  groups.forEach((group, index) => {
    const tab = document.createElement("button");
    const panelId = `${adminMain.dataset.page}-panel-${group.id}`;
    tab.className = "admin-workspace__tab";
    tab.type = "button";
    tab.id = `${adminMain.dataset.page}-tab-${group.id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.dataset.pageTab = group.id;
    tab.textContent = group.label;
    tablist.append(tab);

    const panel = document.createElement("section");
    panel.className = "admin-workspace__panel";
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.dataset.pagePanel = group.id;
    panel.hidden = index !== 0;
    group.children.forEach(childIndex => {
      const child = originalChildren[childIndex];
      if (child) panel.append(child);
    });
    panels.push(panel);
  });

  workspace.append(tablist, ...panels);
  adminMain.insertBefore(workspace, footer || null);
};

setupAdminWorkspace();

const overviewTabs = document.querySelectorAll("[data-overview-tab]");
const overviewPanels = document.querySelectorAll("[data-overview-panel]");
const overviewRequestRows = document.querySelectorAll(".requests-card tbody tr");
let requestCategory = "all";
const requestSearch = document.querySelector(".requests-card .search-box input");

const filterOverviewRequests = () => {
  const query = requestSearch ? requestSearch.value.trim().toLocaleLowerCase("vi") : "";
  overviewRequestRows.forEach(row => {
    const matchesCategory = requestCategory === "all" || row.dataset.requestType === requestCategory;
    const matchesSearch = !query || row.textContent.toLocaleLowerCase("vi").includes(query);
    row.hidden = !matchesCategory || !matchesSearch;
  });
};

overviewTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    overviewTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    overviewPanels.forEach(panel => {
      panel.hidden = panel.dataset.overviewPanel !== tab.dataset.overviewTab;
    });
  });
});

const adminWorkspaceTabs = document.querySelectorAll("[data-page-tab]");
const adminWorkspacePanels = document.querySelectorAll("[data-page-panel]");

adminWorkspaceTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    adminWorkspaceTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    adminWorkspacePanels.forEach(panel => {
      panel.hidden = panel.dataset.pagePanel !== tab.dataset.pageTab;
    });
  });
});

const createPopup = ({ title, detail, action, href }) => {
  const previous = document.querySelector(".admin-dialog");
  if (previous) previous.remove();

  const dialog = document.createElement("dialog");
  dialog.className = "admin-dialog";
  dialog.setAttribute("aria-labelledby", "admin-dialog-title");
  const header = document.createElement("div");
  header.className = "admin-dialog__header";
  const heading = document.createElement("h2");
  heading.id = "admin-dialog-title";
  heading.textContent = title;
  const close = document.createElement("button");
  close.className = "admin-dialog__close";
  close.type = "button";
  close.setAttribute("aria-label", "Đóng cửa sổ");
  close.textContent = "×";
  close.addEventListener("click", () => dialog.close());
  header.append(heading, close);

  const body = document.createElement("div");
  body.className = "admin-dialog__body";
  if (action) {
    const message = document.createElement("p");
    message.textContent = "Đây là bản xem trước giao diện. Thao tác chưa được gửi tới hệ thống.";
    body.append(message);
  } else {
    const list = document.createElement("ul");
    detail.split("\n").map(line => line.trim()).filter(Boolean).slice(0, 7).forEach(line => {
      const item = document.createElement("li");
      item.textContent = line;
      list.append(item);
    });
    if (list.childElementCount) body.append(list);
  }

  const footer = document.createElement("div");
  footer.className = "admin-dialog__footer";
  if (href && href !== "#") {
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = href;
    link.textContent = "Mở trang chi tiết";
    footer.append(link);
  }
  const dismiss = document.createElement("button");
  dismiss.className = "button button--light";
  dismiss.type = "button";
  dismiss.textContent = "Đóng";
  dismiss.addEventListener("click", () => dialog.close());
  footer.append(dismiss);

  dialog.append(header, body, footer);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
  close.focus();
};

const textForDetail = element => element.innerText
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)
  .filter((line, index, lines) => index === 0 || line !== lines[index - 1])
  .slice(0, 7)
  .join("\n");

document.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const overviewTab = target.closest("[data-overview-tab]");
  if (overviewTab) return;

  const actionButton = target.closest("[data-action]");
  if (actionButton) {
    event.preventDefault();
    createPopup({
      title: actionButton.textContent.trim().replace(/^[✓+↓▦☷⌖]+\s*/, "") || "Thao tác quản trị",
      detail: "",
      action: true,
    });
    return;
  }

  const requestTab = target.closest(".request-tabs [data-request-filter]");
  if (requestTab) {
    document.querySelectorAll(".request-tabs [data-request-filter]").forEach(tab => tab.classList.toggle("is-active", tab === requestTab));
    requestCategory = requestTab.dataset.requestFilter;
    filterOverviewRequests();
    return;
  }

  const row = target.closest(".admin-table tbody tr, .requests-card tbody tr");
  const card = target.closest(".card");
  const anchor = target.closest("a");
  const control = target.closest("button, input, select, textarea, label");
  if (!row && !card) return;
  if (control && !anchor && !row) return;

  event.preventDefault();
  const content = row || card;
  const heading = content.querySelector("h1, h2, h3, .stat-card__top, .admin-metric > div, .task-item > span:nth-child(2), td strong");
  createPopup({
    title: heading ? heading.innerText.trim().split("\n")[0] : "Chi tiết",
    detail: textForDetail(content),
    href: anchor ? anchor.getAttribute("href") : null,
  });
});

if (requestSearch) requestSearch.addEventListener("input", filterOverviewRequests);

document.querySelectorAll(".card").forEach(card => {
  const title = card.querySelector("h1, h2, h3, .stat-card__top, .admin-metric > div, .task-item > span:nth-child(2)");
  card.tabIndex = 0;
  if (title) card.setAttribute("aria-label", `Xem chi tiết: ${title.innerText.trim().split("\n")[0]}`);
});

document.querySelectorAll(".admin-table tbody tr, .requests-card tbody tr").forEach(row => {
  row.tabIndex = 0;
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target || (!target.matches(".card, .admin-table tbody tr, .requests-card tbody tr"))) return;
  event.preventDefault();
  target.click();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const dialog = document.querySelector(".admin-dialog");
    if (dialog && dialog.open) dialog.close();
  }
});
