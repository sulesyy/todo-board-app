
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const columns = document.querySelectorAll(".column");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");

  let currentTask = null;

  addBtn.addEventListener("click", () => {
    const title = input.value.trim();
    if (!title) return alert("Lütfen bir görev başlığı yazın!");
    createTask({ title, desc: "" }, "draft");
    input.value = "";
    saveToLocalStorage();
  });

  function createTask(taskData, columnId) {
    const task = document.createElement("div");
    task.classList.add("task");
    task.draggable = true;
    task.textContent = taskData.title;
    task.dataset.title = taskData.title;
    task.dataset.desc = taskData.desc || "";

    task.addEventListener("dragstart", dragStart);
    task.addEventListener("dragend", dragEnd);
    task.addEventListener("click", () => openModal(task));

    const targetCol = document.getElementById(columnId);
    if (targetCol) targetCol.appendChild(task);
    else {
      console.warn("createTask: columnId bulunamadı:", columnId);
      document.getElementById('draft').appendChild(task);
    }
  }

  let draggedTask = null;
  function dragStart() {
    draggedTask = this;
    setTimeout(() => (this.style.display = "none"), 0);
  }
  function dragEnd() {
    this.style.display = "block";
    draggedTask = null;
    saveToLocalStorage();
  }

  columns.forEach(column => {
    column.addEventListener("dragover", e => {
      e.preventDefault();
      column.classList.add("highlight");
    });
    column.addEventListener("dragleave", () => {
      column.classList.remove("highlight");
    });
    column.addEventListener("drop", () => {
      column.classList.remove("highlight");
      if (draggedTask) column.appendChild(draggedTask);
      saveToLocalStorage();
    });
  });

  function openModal(task) {
    currentTask = task;
    modalTitle.value = task.dataset.title || "";
    modalDesc.value = task.dataset.desc || "";
    modal.style.display = "flex";
  }

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    currentTask = null;
  });
  saveBtn.addEventListener("click", () => {
    if (!currentTask) return;
    const newTitle = modalTitle.value.trim() || "İsimsiz Görev";
    const newDesc = modalDesc.value.trim();

    currentTask.textContent = newTitle;
    currentTask.dataset.title = newTitle;
    currentTask.dataset.desc = newDesc;

    modal.style.display = "none";
    currentTask = null;
    saveToLocalStorage();
  });
  function saveToLocalStorage() {
    const data = {};
    columns.forEach(col => {
      const tasks = Array.from(col.querySelectorAll(".task")).map(t => ({
        title: t.dataset.title,
        desc: t.dataset.desc
      }));
      data[col.id] = tasks;
    });
    localStorage.setItem("todoData", JSON.stringify(data));
  }
  function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("todoData"));
    if (!data) return;
    Object.keys(data).forEach(colId => {
      data[colId].forEach(taskObj => createTask(taskObj, colId));
    });
  }

  loadFromLocalStorage();
});
