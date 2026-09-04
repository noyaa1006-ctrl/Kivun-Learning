import {
  SUBJECTS,
  createTagPicker,
  normalizeList
} from "./catalog.js";

const style = document.createElement("style");

style.textContent = `
.subject-picker {
  position: relative;
}

.tag-picker-selected {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  min-height: 35px;
  margin-bottom: 8px;
}

.tag-picker-tag {
  padding: 6px 9px;
  border: 0;
  border-radius: 8px;
  color: #08785c;
  background: #e5faf0;
  font-family: Heebo, Arial, sans-serif;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.tag-picker-tag:hover {
  color: #a32f2a;
  background: #fff0ef;
}

.tag-picker-empty {
  color: #8a93a8;
  font-size: 12px;
}

.tag-picker-search {
  width: 100%;
  padding: 12px;
  border: 1px solid #e4e9f4;
  border-radius: 11px;
  outline: 0;
  color: #1d2746;
  background: #fff;
  font: inherit;
}

.tag-picker-search:focus {
  border-color: #0b9d78;
  box-shadow: 0 0 0 3px #dff7ed;
}

.tag-picker-options {
  position: absolute;
  z-index: 100;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  max-height: 245px;
  overflow-y: auto;
  padding: 7px;
  border: 1px solid #e4e9f4;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 15px 35px rgba(20, 34, 75, 0.15);
}

.tag-picker-options.hidden {
  display: none;
}

.tag-picker-option {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  color: #4e5b76;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  cursor: pointer;
}

.tag-picker-option:hover,
.tag-picker-option:focus {
  color: #08785c;
  background: #effdf7;
  outline: none;
}

.tag-picker-no-results {
  padding: 12px;
  color: #8a93a8;
  font-size: 13px;
  text-align: center;
}
`;

document.head.appendChild(style);

function enhanceSubjectInput(inputId) {
  const originalInput = document.getElementById(inputId);

  if (!originalInput || originalInput.dataset.pickerReady === "true") {
    return null;
  }

  originalInput.dataset.pickerReady = "true";
  originalInput.type = "hidden";

  const pickerRoot = document.createElement("div");
  pickerRoot.className = "subject-picker";
  originalInput.insertAdjacentElement("afterend", pickerRoot);

  const picker = createTagPicker({
    root: pickerRoot,
    options: SUBJECTS,
    selected: normalizeList(originalInput.value),
    placeholder: "חיפוש מקצוע...",
    maximum: 12,

    onChange(selectedSubjects) {
      originalInput.value = selectedSubjects.join(", ");

      originalInput.dispatchEvent(
        new Event("input", { bubbles: true })
      );

      originalInput.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }
  });

  originalInput.addEventListener("subject-picker-refresh", () => {
    picker.setSelected(normalizeList(originalInput.value));
  });

  return picker;
}

function startSubjectPickers() {
  enhanceSubjectInput("student-subjects");
  enhanceSubjectInput("teacher-subjects");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startSubjectPickers);
} else {
  startSubjectPickers();
}